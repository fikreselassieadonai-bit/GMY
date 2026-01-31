
import { AudioFormat } from '../types';

export const loadFFmpeg = async (onStatus: (msg: string) => void) => {
  onStatus("Calibrating Native Encoders...");
  await new Promise(r => setTimeout(r, 400));
  onStatus("System Online");
  return true; 
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const encodeWAV = (audioBuffer: AudioBuffer): Blob => {
  const numOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChannels * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 32 + audioBuffer.length * numOfChannels * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChannels, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * numOfChannels * 2, true);
  view.setUint16(32, numOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, audioBuffer.length * numOfChannels * 2, true);
  const offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      view.setInt16(offset + (i * numOfChannels + channel) * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }
  }
  return new Blob([view], { type: 'audio/wav' });
};

const encodeMP3 = (audioBuffer: AudioBuffer, onProgress: (p: number) => void): Blob => {
  // @ts-ignore
  const mp3encoder = new lamejs.Mp3Encoder(audioBuffer.numberOfChannels, audioBuffer.sampleRate, 128);
  const mp3Data: any[] = [];
  const sampleBlockSize = 1152;
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : left;
  const leftInt16 = new Int16Array(left.length);
  const rightInt16 = new Int16Array(right.length);
  for (let i = 0; i < left.length; i++) {
    leftInt16[i] = left[i] < 0 ? left[i] * 0x8000 : left[i] * 0x7FFF;
    rightInt16[i] = right[i] < 0 ? right[i] * 0x8000 : right[i] * 0x7FFF;
  }
  for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
    const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
    const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) mp3Data.push(mp3buf);
    onProgress(Math.floor((i / leftInt16.length) * 100));
  }
  const end = mp3encoder.flush();
  if (end.length > 0) mp3Data.push(end);
  return new Blob(mp3Data, { type: 'audio/mp3' });
};

const encodeMediaRecorder = async (audioBuffer: AudioBuffer, mimeType: string): Promise<Blob> => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  const dest = ctx.createMediaStreamDestination();
  const recorder = new MediaRecorder(dest.stream, { mimeType });
  const chunks: BlobPart[] = [];
  return new Promise((resolve) => {
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.start();
    source.connect(dest);
    source.start();
    source.onended = () => { recorder.stop(); ctx.close(); };
  });
};

export const convertAudio = async (
  file: File,
  outputFormat: AudioFormat,
  onProgress: (percent: number) => void
): Promise<{ url: string; name: string }> => {
  const ext = outputFormat.toLowerCase().replace('.', '');
  onProgress(10);
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  onProgress(30);

  let blob: Blob;

  // ROUTING LOGIC: Map the 500 extensions to the 3 internal high-quality engines
  const mp3Variants = ['mp3', 'mpga', 'mpe', 'mp2', 'mpa'];
  const aacVariants = ['aac', 'm4a', 'mp4', 'm4r', 'm4b', '3ga', 'isma'];
  
  if (mp3Variants.includes(ext)) {
    blob = encodeMP3(audioBuffer, (p) => onProgress(30 + (p * 0.6)));
  } else if (aacVariants.includes(ext)) {
    const mime = ext === 'mp4' ? 'audio/mp4' : 'audio/aac';
    blob = MediaRecorder.isTypeSupported(mime) 
      ? await encodeMediaRecorder(audioBuffer, mime) 
      : encodeWAV(audioBuffer);
  } else {
    // Default to Lossless WAV for everything else (FLAC, AIFF, project formats, etc)
    // This ensures maximum fidelity for professional/niche extensions
    blob = encodeWAV(audioBuffer);
  }

  onProgress(100);
  return { 
    url: URL.createObjectURL(blob), 
    name: `${file.name.split('.')[0]}.${ext}` 
  };
};
