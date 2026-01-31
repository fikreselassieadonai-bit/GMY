
import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Upload, 
  Download, 
  Trash2, 
  RefreshCw, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  ChevronRight,
  Loader2,
  Cpu,
  Zap,
  Search,
  ChevronDown
} from 'lucide-react';
import { FileState, AudioFormat, FormatDefinition } from './types';
import { loadFFmpeg, convertAudio } from './services/ffmpegService';
import { analyzeAudioWithAI } from './services/geminiService';

// Format Data Injected (Summary)
const ALL_FORMATS: FormatDefinition[] = [
  { ext: "SVP", name: "Synthesizer V Project" }, { ext: "SEQUENCE", name: "Online Sequencer Sequence" },
  { ext: "CEOL", name: "Bosca Ceoil Song" }, { ext: "FUR", name: "Furnace Module" },
  { ext: "FTM", name: "Finale 2012 Score Template" }, { ext: "MTM", name: "MultiTracker Module" },
  { ext: "ABC", name: "ABC Music Notation" }, { ext: "UST", name: "UTAU Sequence Text File" },
  { ext: "WEBA", name: "WebM Audio File" }, { ext: "XRNS", name: "Renoise Song File" },
  { ext: "MTI", name: "MadTracker Instrument" }, { ext: "FLP", name: "FL Studio Project" },
  { ext: "COPY", name: "Sony Ericsson Protected Content" }, { ext: "SDT", name: "Electronic Arts Sound Data File" },
  { ext: "MP3", name: "MP3 Audio" }, { ext: "GBS", name: "Game Boy Sound File" },
  { ext: "GP", name: "Guitar Pro 7 Document" }, { ext: "VSQ", name: "VOCALOID2 Project File" },
  { ext: "AKP", name: "Akai Sampler File" }, { ext: "EC3", name: "Enhanced Audio Codec 3 File" },
  { ext: "TOC", name: "PSP Custom Audio Track" }, { ext: "SDS", name: "MIDI Sample Dump Standard File" },
  { ext: "AUP", name: "Audacity Project File" }, { ext: "SF2", name: "SoundFont 2 Sound Bank" },
  { ext: "ASD", name: "Ableton Live Sample Analysis" }, { ext: "MUI", name: "Myriad User Instrument File" },
  { ext: "FLAC", name: "Free Lossless Audio Codec File" }, { ext: "WPROJ", name: "Wwise Project File" },
  { ext: "MSCX", name: "MuseScore Music Score File" }, { ext: "TG", name: "TuxGuitar Document" },
  { ext: "ALS", name: "Ableton Live Set File" }, { ext: "MIDI", name: "MIDI Music Data" },
  { ext: "PTXT", name: "Pro Tools Session Template" }, { ext: "SLP", name: "SpectraLayers Pro Project" },
  { ext: "NKI", name: "KONTAKT Instrument File" }, { ext: "DMSE", name: "Sound Editor Project File" },
  { ext: "AMXD", name: "Ableton Max Patch File" }, { ext: "FSC", name: "FL Studio Score File" },
  { ext: "MINIGSF", name: "Game Boy Advance Song File" }, { ext: "SNGX", name: "ChordWizard Song" },
  { ext: "CGRP", name: "Pro Tools Clip Group File" }, { ext: "DSM", name: "Digital Sound Module" },
  { ext: "DCT", name: "Dictation Audio File" }, { ext: "GSM", name: "Global System for Mobile Audio" },
  { ext: "NSMP", name: "Nord Sample" }, { ext: "CWB", name: "Cakewalk Bundle" },
  { ext: "FEV", name: "FMOD Audio Events File" }, { ext: "SC2", name: "Sample Cell II Instrument Definition" },
  { ext: "VPW", name: "VoxPro Wave File" }, { ext: "GSF", name: "Game Boy Advance Sound File" },
  { ext: "MKA", name: "Matroska Audio" }, { ext: "CWS", name: "ChordWizard Song" },
  { ext: "OMG", name: "OpenMG Audio File" }, { ext: "M4R", name: "iPhone Ringtone" },
  { ext: "MMLP", name: "Music Macro Language Project" }, { ext: "VOXAL", name: "Voxal Project File" },
  { ext: "AMF", name: "Advanced Module File" }, { ext: "M3UP", name: "M3U Playlist (UTF-8)" },
  { ext: "MPTM", name: "OpenMPT Module" }, { ext: "KT3", name: "Battery 3 Drum Kit File" },
  { ext: "IGP", name: "Igor Published Music Notation File" }, { ext: "H5S", name: "POD HD500 Edit Set List" },
  { ext: "CDO", name: "Crescendo Music Notation File" }, { ext: "XMU", name: "Expressive Music Container File" },
  { ext: "SAF", name: "Secure Audio File" }, { ext: "DFF", name: "Direct Stream Digital Audio" },
  { ext: "NSF", name: "NES Sound Format Audio" }, { ext: "ACP", name: "aacPlus Audio File" },
  { ext: "ARIA", name: "Chipsounds Sound File" }, { ext: "VDJ", name: "VirtualDJ Audio Sample File" },
  { ext: "SFK", name: "Sound Forge Pro Audio Peak File" }, { ext: "BAND", name: "GarageBand Project" },
  { ext: "APL", name: "Monkey's Audio Track Information File" }, { ext: "EOP", name: "Everyone Piano Score" },
  { ext: "MID", name: "MIDI File" }, { ext: "GP5", name: "Guitar Pro 5 Tablature File" },
  { ext: "RX2", name: "REX2 Audio File" }, { ext: "ACM", name: "Interplay Audio File" },
  { ext: "4MP", name: "4-MP3 Database File" }, { ext: "BUN", name: "Cakewalk Bundle File" },
  { ext: "RSF", name: "LEGO MINDSTORMS EV3 Robot Sound File" }, { ext: "MSCZ", name: "MuseScore Compressed Score File" },
  { ext: "ANG", name: "Anghami Audio File" }, { ext: "PEK", name: "Adobe Peak Waveform File" },
  { ext: "STY", name: "Band-in-a-Box Styles File" }, { ext: "RMJ", name: "Real Media Jukebox Audio File" },
  { ext: "OGG", name: "Ogg Vorbis Audio" }, { ext: "SNG", name: "Korg Trinity Song File" },
  { ext: "DCF", name: "DRM Content Format File" }, { ext: "G726", name: "G.726 ADPCM Audio" },
  { ext: "ABM", name: "Music Album" }, { ext: "VSQX", name: "VOCALOID3 Project File" },
  { ext: "MMPZ", name: "LMMS Project File" }, { ext: "LOGICX", name: "Logic Pro Project" },
  { ext: "AFC", name: "Mass Effect 2 Audio File" }, { ext: "SFPACK", name: "Packed SoundFont File" },
  { ext: "VAG", name: "PlayStation Compressed Audio" }, { ext: "SGP", name: "MP3 Audio Mixer Sound Group Project" },
  { ext: "ALC", name: "Ableton Live Clip File" }, { ext: "WAV", name: "WAVE Audio" },
  { ext: "MXL", name: "Compressed MusicXML File" }, { ext: "VLC", name: "VLC Playlist" },
  { ext: "PLA", name: "Sansa Playlist File" }, { ext: "ITI", name: "Impulse Tracker Instrument" },
  { ext: "EMX", name: "eMusic Download File" }, { ext: "S3M", name: "ScreamTracker 3 Module" },
  { ext: "AC3", name: "Audio Codec 3 File" }, { ext: "QCP", name: "PureVoice Audio" },
  { ext: "OVW", name: "Logic Pro Overview File" }, { ext: "NCW", name: "Native Compressed Wave File" },
  { ext: "PSM", name: "Protracker Studio Module" }, { ext: "STM", name: "Scream Tracker 2 Module" },
  { ext: "SPH", name: "NIST SPHERE Audio File" }, { ext: "RIP", name: "Hit'n'Mix Audio Mashup File" },
  { ext: "FTM", name: "FamiTracker Module" }, { ext: "DM", name: "DRM Delivery Message" },
  { ext: "VPR", name: "VOCALOID Project" }, { ext: "RNS", name: "Reason Song File" },
  { ext: "ACT", name: "ADPCM Compressed Audio" }, { ext: "CUE", name: "Cue Sheet File" },
  { ext: "M3U8", name: "UTF-8 M3U Playlist" }, { ext: "RMX", name: "RealJukebox Format" },
  { ext: "HCA", name: "High Compression Audio File" }, { ext: "VQF", name: "TwinVQ Audio File" },
  { ext: "NRT", name: "Nokia Ringtone" }, { ext: "GPK", name: "WaveLab Audio Peak File" },
  { ext: "AT3", name: "ATRAC3 Audio File" }, { ext: "SSEQ", name: "Nintendo DS Sound Sequence File" },
  { ext: "ROL", name: "Ad Lib Synthesized Instrument" }, { ext: "Q2", name: "Winamp Equalizer Auto-Load Presets File" },
  { ext: "Q1", name: "Winamp Equalizer Presets File" }, { ext: "ZPA", name: "Vielklang Audio Metadata File" },
  { ext: "OGA", name: "Ogg Vorbis Audio File" }, { ext: "SESX", name: "Audition Session" },
  { ext: "SIB", name: "Sibelius Score" }, { ext: "REX", name: "ReCycle Loop File" },
  { ext: "FLM", name: "FL Studio Mobile Project" }, { ext: "RGRP", name: "Pro Tools Region Group File" },
  { ext: "SMF", name: "Standard MIDI File" }, { ext: "XPF", name: "LMMS Preset File" },
  { ext: "CTS", name: "CrazyTalk Script File" }, { ext: "LOGIC", name: "Logic Pro Project File" },
  { ext: "AOB", name: "DVD-Audio Audio Object File" }, { ext: "INS", name: "Sample Cell II Instrument Definition File" },
  { ext: "WAVE", name: "WAVE Sound File" }, { ext: "WMA", name: "Windows Media Audio" },
  { ext: "M4A", name: "MPEG-4 Audio" }, { ext: "M3U", name: "M3U Media Playlist" },
  { ext: "TRAK", name: "Traktor Content Pack File" }, { ext: "PCAST", name: "iTunes Podcast File" },
  { ext: "WUS", name: "WUTG Tagged Audio" }, { ext: "ACD", name: "ACID Project" },
  { ext: "PANDORA", name: "Pandora Android App Executable" }, { ext: "SBI", name: "Sound Blaster Instrument" },
  { ext: "5XE", name: "Line 6 POD HD500X Edit Preset File" }, { ext: "CIDB", name: "iTunes CD Information File" },
  { ext: "CKB", name: "Cricket Audio Bank File" }, { ext: "PIXIMOD", name: "PixiTracker Module" },
  { ext: "SVD", name: "Roland Patch File" }, { ext: "ISMA", name: "IIS Smooth Streaming Audio File" },
  { ext: "MPU", name: "MPEG Layer 3 Audio File" }, { ext: "S3I", name: "Scream Tracker 3 Instrument" },
  { ext: "WFP", name: "WaveFront Program File" }, { ext: "3GA", name: "3GPP Audio File" },
  { ext: "PTX", name: "Pro Tools Session File" }, { ext: "SWA", name: "Shockwave Audio" },
  { ext: "VPL", name: "Karaoke Player Playlist" }, { ext: "RAM", name: "Real Audio Metadata File" },
  { ext: "MOD", name: "Music Module File" }, { ext: "MED", name: "Amiga MED Sound File" },
  { ext: "W01", name: "Yamaha SY Series Wave File" }, { ext: "OMA", name: "Sony OpenMG Music File" },
  { ext: "YOOKOO", name: "Yookoo Player Playlist File" }, { ext: "MUS", name: "Minecraft Music File" },
  { ext: "XA", name: "The Sims Audio File" }, { ext: "PKF", name: "Adobe Audition Peak File" },
  { ext: "WRK", name: "Cakewalk Music Project" }, { ext: "WAX", name: "Windows Media Audio Redirect" },
  { ext: "AUP3", name: "Audacity 3 Project File" }, { ext: "NOTE", name: "Notessimo Composition" },
  { ext: "CWT", name: "Cakewalk SONAR Template" }, { ext: "H5B", name: "POD HD500 Edit Bundle" },
  { ext: "VYF", name: "Samsung Digital Voice Recorder File" }, { ext: "FTMX", name: "Finale 2014 Score Template" },
  { ext: "UW", name: "Unsigned Word Audio File" }, { ext: "B4S", name: "Winamp Playlist File" },
  { ext: "AIFF", name: "Audio Interchange File Format" }, { ext: "INS", name: "Adlib Tracker Instrument File" },
  { ext: "KSD", name: "Native Instruments Massive Sound File" }, { ext: "MUS", name: "Finale Notation File (Legacy)" },
  { ext: "WFM", name: "Pro Tools Wave Cache File" }, { ext: "PTT", name: "Pro Tools Session Template" },
  { ext: "MTP", name: "MadTracker 2 Pattern" }, { ext: "AIF", name: "Audio Interchange File Format" },
  { ext: "TAK", name: "Tom's Lossless Audio Kompressor File" }, { ext: "MUX", name: "Trackmania Music File" },
  { ext: "RAD", name: "Reality Adlib Tracker Module" }, { ext: "NKM", name: "Kontakt Multi Instrument File" },
  { ext: "KMP", name: "Korg Keymap File" }, { ext: "MTF", name: "Multi Tracker File" },
  { ext: "WPP", name: "WavePad Project File" }, { ext: "BRSTM", name: "BRSTM Audio Stream" },
  { ext: "MO3", name: "MO3 Audio" }, { ext: "669", name: "UNIS Composer 669 Module" },
  { ext: "RSO", name: "NXT Brick Audio File" }, { ext: "BNK", name: "Adlib Instrument Bank" },
  { ext: "M4B", name: "MPEG-4 Audiobook" }, { ext: "OMF", name: "Open Media Framework File" },
  { ext: "CAF", name: "Core Audio File" }, { ext: "DMSA", name: "Music Disc Creator Project File" },
  { ext: "SXT", name: "Propellerhead Reason NN-XT Patch File" }, { ext: "BNL", name: "Talking Reading Pen Audio File" },
  { ext: "PTM", name: "PolyTracker Module" }, { ext: "PTS", name: "Pro Tools Session" },
  { ext: "MPDP", name: "MixPad Project File" }, { ext: "MDR", name: "ModPlug Compressed Module" },
  { ext: "WFB", name: "WaveFront Sound Bank" }, { ext: "H4B", name: "Line 6 POD HD400 Edit Bundle" },
  { ext: "WVC", name: "WavPack Correction File" }, { ext: "BDD", name: "CARA Sound Radiation Data File" },
  { ext: "AGM", name: "DTS Multi-channel Pro Packer File" }, { ext: "CDDA", name: "CD Digital Audio File" },
  { ext: "GPBANK", name: "Guitar Pro Sound Bank File" }, { ext: "BIDULE", name: "Bidule Layout File" },
  { ext: "MBR", name: "Zune Smooth Streaming File" }, { ext: "NKX", name: "Kontakt Monolith Container File" },
  { ext: "STAP", name: "Soundtrack Pro Audio Project File" }, { ext: "CAFF", name: "Core Audio File" },
  { ext: "6CM", name: "Six Channel Module" }, { ext: "SSND", name: "Synclavier Sound File" },
  { ext: "A2P", name: "Adlib Tracker II Pattern File" }, { ext: "SOU", name: "SBStudio II Sound File" },
  { ext: "H0", name: "Movie Edit Pro Waveform Information File" }, { ext: "PPCX", name: "Adobe Presenter Presentation Audio File" },
  { ext: "RTA", name: "TrueRTA Project File" }, { ext: "TAK", name: "Music Maker Take File" },
  { ext: "LOF", name: "Audacity File List" }, { ext: "MX5TEMPLATE", name: "Mixcraft 5 Audio Project Template" },
  { ext: "MX4", name: "Mixcraft 4 Audio Project" }, { ext: "MX3", name: "Mixcraft 3 Audio Project" },
  { ext: "EMD", name: "ABT Extended Module" }, { ext: "CWP", name: "Cakewalk SONAR Project" },
  { ext: "W64", name: "Sony Wave64 Audio File" }, { ext: "SF", name: "IRCAM Sound File" },
  { ext: "AA", name: "Audible Audio Book File" }, { ext: "XSPF", name: "XML Shareable Playlist File" },
  { ext: "BWW", name: "Bagpipe Player File" }, { ext: "VOX", name: "Dialogic Voice Audio File" },
  { ext: "AGR", name: "Ableton Groove File" }, { ext: "CDA", name: "CD Audio Track Shortcut" },
  { ext: "DS", name: "LMMS DrumSynth File" }, { ext: "SNG", name: "MIDI Song" },
  { ext: "ZVD", name: "Zyxel Voice File" }, { ext: "ENC", name: "Encore Musical Notation" },
  { ext: "XSP", name: "Kodi Smart Playlist File" }, { ext: "WPK", name: "Nero Wave Editor File" },
  { ext: "SDAT", name: "Nintendo DS Sound Data File" }, { ext: "PCM", name: "Pulse Code Modulation File" },
  { ext: "XM", name: "Fasttracker 2 Extended Module" }, { ext: "NWC", name: "NoteWorthy Composer File" },
  { ext: "MPA", name: "MPEG-2 Audio File" }, { ext: "LSO", name: "Logic Audio Project" },
  { ext: "CDR", name: "Raw CD Audio Data" }, { ext: "OMX", name: "OtsAV Media Library Information File" },
  { ext: "DTSHD", name: "DTS-HD Master Audio File" }, { ext: "F4A", name: "Adobe Flash Protected Audio File" },
  { ext: "DRA", name: "Nuance Dragon Voice Recording File" }, { ext: "BWG", name: "BrainWave Generator Audio File" },
  { ext: "SBG", name: "SBaGen Binaural Beat File" }, { ext: "MUX", name: "Myriad Stand-Alone Music Score" },
  { ext: "SD", name: "ESPS Sampled Data" }, { ext: "RAW", name: "Raw Audio Data" },
  { ext: "AMR", name: "Adaptive Multi-Rate Codec File" }, { ext: "WVE", name: "WaveEditor Project File" },
  { ext: "DVF", name: "Sony Digital Voice File" }, { ext: "XA", name: "PlayStation Extended Architecture Audio File" },
  { ext: "AAC", name: "Advanced Audio Coding File" }, { ext: "RA", name: "RealAudio File" },
  { ext: "IFF", name: "Interchange File Format" }, { ext: "MUSICXML", name: "MusicXML File" },
  { ext: "RMI", name: "RMID MIDI File" }, { ext: "STREAMDECKAUDIO", name: "Stream Deck Audio" },
  { ext: "GSFLIB", name: "Game Boy Advance Song Library" }, { ext: "MMP", name: "MixMeister Playlist" },
  { ext: "MPD", name: "Melodyne Project" }, { ext: "NSMPPROJ", name: "Nord Sample Editor Project" },
  { ext: "SYH", name: "Synchomatic Instrument" }, { ext: "SYW", name: "SY99/SY85 Audio" },
  { ext: "FPA", name: "Finale Performance Assessment" }, { ext: "NML", name: "Traktor Collection File" },
  { ext: "U", name: "AU Audio File" }, { ext: "DRG", name: "I-Doser Audio Drug File" },
  { ext: "MXMF", name: "Mobile XMF Ringtone File" }, { ext: "PVC", name: "Panasonic VM1 Voice File" },
  { ext: "MT2", name: "MadTracker 2 Module" }, { ext: "RCY", name: "ReCycle 1.x Document" },
  { ext: "VGZ", name: "Video Game Music Compressed File" }, { ext: "WTPT", name: "WireTap Studio Packaged Track" },
  { ext: "MMP", name: "LMMS Project File" }, { ext: "CPR", name: "Cubase Project" },
  { ext: "VPM", name: "Garmin Voice File" }, { ext: "DSS", name: "Digital Speech Standard File" },
  { ext: "8SVX", name: "Amiga 8-Bit Sound File" }, { ext: "NKC", name: "Kontakt Library Data File" },
  { ext: "5XB", name: "Line 6 POD HD500X Edit Bundle" }, { ext: "M4P", name: "iTunes Music Store Audio File" },
  { ext: "AU", name: "Sun Microsystems Audio File" }, { ext: "GPX", name: "Guitar Pro 6 Document" },
  { ext: "VIP", name: "MAGIX Samplitude Music Studio Project" }, { ext: "MDC", name: "MidiCo Karaoke Audio File" },
  { ext: "LWV", name: "Linguistically Enhanced Sound File" }, { ext: "NKS", name: "Kontakt Monolith Container" },
  { ext: "8CM", name: "Eight Channel Module" }, { ext: "DW", name: "David Whittaker Audio File" },
  { ext: "MOGG", name: "Multitrack Ogg File" }, { ext: "IGR", name: "Igor Engraver File" },
  { ext: "NPL", name: "Cubase Library File" }, { ext: "AB", name: "Ambling BookPlayer MP3 File" },
  { ext: "WV", name: "WavPack Audio File" }, { ext: "SEQ", name: "PowerTracks Pro Audio Project File" },
  { ext: "KAR", name: "Karaoke MIDI File" }, { ext: "AMS", name: "Velvet Studio Advanced Module System" },
  { ext: "LA", name: "Lossless Audio File" }, { ext: "FRG", name: "Sound Forge Pro Project" },
  { ext: "H5E", name: "POD HD500 Edit Preset" }, { ext: "MX5", name: "Mixcraft 5 Audio Project" },
  { ext: "MYR", name: "Myriad Music File" }, { ext: "MPGA", name: "MPEG-1 Layer 3 Audio File" },
  { ext: "NVF", name: "Creative Labs NVF Audio File" }, { ext: "MUSX", name: "Finale Notation File" },
  { ext: "OBW", name: "Superior Drummer Sounds File" }, { ext: "CFA", name: "Adobe Conformed Audio File" },
  { ext: "PSF", name: "Portable Sound File" }, { ext: "MMM", name: "Music Maker Arrangement File" },
  { ext: "UAX", name: "Unreal Audio Package" }, { ext: "DTS", name: "DTS Encoded Audio File" },
  { ext: "A2M", name: "Adlib Tracker II File" }, { ext: "ADT", name: "ADTS Audio File" },
  { ext: "AVASTSOUNDS", name: "Avast Soundpack File" }, { ext: "ALL", name: "Cubasis Project File" },
  { ext: "PEAK", name: "Steinberg Peak File" }, { ext: "SNS", name: "SNS Video Game Audio File" },
  { ext: "SYN", name: "SimSynth Document" }, { ext: "ODM", name: "OverDrive Media File" },
  { ext: "ICS", name: "IC Recorder Sound File" }, { ext: "NRA", name: "Nero Audio Compilation" },
  { ext: "RDVXZ", name: "RedVox Infrasound Recorder Audio File" }, { ext: "SONG", name: "AudioSauna Song File" },
  { ext: "CONFORM", name: "Conformalizer Change List" }, { ext: "SMA", name: "SmartMusic Accompaniment File" },
  { ext: "SNG", name: "n-Track Studio Song Project" }, { ext: "WUT", name: "WUTG Tag File" },
  { ext: "KOZ", name: "Audiokoz Music File" }, { ext: "KOZ", name: "Bell Cellular Music" },
  { ext: "SFZ", name: "SFZ Sample Definition File" }, { ext: "MSMPL_BANK", name: "Korg microSAMPLER Bank Data File" },
  { ext: "M5P", name: "MachFive Preset File" }, { ext: "RPL", name: "Dolby Cinema Print Master File" },
  { ext: "SSM", name: "Sound Clip Archive" }, { ext: "BWF", name: "Broadcast Wave File" },
  { ext: "RNG", name: "Nokia Composer Ringtone" }, { ext: "SFAS", name: "Sound Forge Audio Studio Project" },
  { ext: "NKSF", name: "Native Kontrol Standard Preset" }, { ext: "SSP", name: "Serato Studio Project" },
  { ext: "H2SONG", name: "Hydrogen Song" }, { ext: "FZF", name: "Casio FZ-1 Full Voice Dump" },
  { ext: "FZV", name: "Casio FZ-1 Voice Dump" }, { ext: "G721", name: "G.721 ADPCM Audio" },
  { ext: "K26", name: "Kurzweil K2600 File" }, { ext: "ULT", name: "Ultra Tracker Module" },
  { ext: "WWU", name: "Wwise Work Unit" }, { ext: "REPEAKS", name: "REAPER Peak File" },
  { ext: "RSN", name: "Reason Project File" }, { ext: "NSA", name: "Nullsoft Streaming Audio File" },
  { ext: "PNA", name: "PhatNoise Audio File" }, { ext: "VC3", name: "VSampler Soundbank File" },
  { ext: "RCD", name: "KaiOS Audio" }, { ext: "CAPOBUNDLE", name: "Capo Project" },
  { ext: "DPDOC", name: "Digital Performer Project" }, { ext: "AAXC", name: "Encrypted Audible Enhanced Audiobook" },
  { ext: "FMS", name: "FamiStudio Project" }, { ext: "OVEX", name: "Overture 5 Musical Score" },
  { ext: "SLX", name: "SpectraLayers Pro Project" }, { ext: "HBE", name: "Line 6 POD HD Edit Preset File" },
  { ext: "ACD-BAK", name: "MAGIX ACID Project Backup File" }, { ext: "HSB", name: "HALion Sound Bank File" },
  { ext: "GROOVE", name: "ACID Groove File" }, { ext: "VAP", name: "Dialogic Indexed Voice Audio File" },
  { ext: "ZPL", name: "Zune Playlist" }, { ext: "DS2", name: "Olympus DSS Pro Audio File" },
  { ext: "PSF1", name: "PlayStation Sound Format File" }, { ext: "GIG", name: "Tascam GigaSampler File" },
  { ext: "SNIBB", name: "Snibbetracker Module" }, { ext: "KSC", name: "Korg Trinity/Triton Script File" },
  { ext: "PAC", name: "SBStudio II Song File" }, { ext: "PSF2", name: "PlayStation Sound Format File" },
  { ext: "GBPROJ", name: "GarageBand Project" }, { ext: "ARIAX", name: "Chipsounds XML Sound File" },
  { ext: "VB", name: "Grand Theft Auto Audio File" }, { ext: "HBS", name: "Line 6 POD HD Edit Setlist File" },
  { ext: "NMSV", name: "Native Instruments Massive Sound File" }, { ext: "SAP", name: "Atari SAP Music File" },
  { ext: "AAX", name: "Audible Enhanced Audiobook File" }, { ext: "RFL", name: "Reason ReFill Sound Bank" },
  { ext: "AMZ", name: "Amazon MP3 Downloader File" }, { ext: "KSF", name: "Korg Trinity/Triton Sample File" },
  { ext: "ADV", name: "Ableton Device Preset File" }, { ext: "APE", name: "Monkey's Audio" },
  { ext: "A2B", name: "Adlib Tracker II Instrument Bank" }, { ext: "PHO", name: "MBROLA Phonetic Data File" },
  { ext: "CLP", name: "Finale Clip" }, { ext: "PTF", name: "Pro Tools Session File (Legacy)" },
  { ext: "MPC", name: "Musepack Compressed Audio File" }, { ext: "MP2", name: "MPEG Layer II Compressed Audio File" },
  { ext: "OTS", name: "OtsAV Album File" }, { ext: "MMF", name: "Synthetic Music Mobile Application File" },
  { ext: "AIFC", name: "Compressed Audio Interchange File" }, { ext: "PCA", name: "Perfect Clarity Audio File" },
  { ext: "PNO", name: "Windows 8 Piano Song" }, { ext: "SMP", name: "SmartMusic Performance File" },
  { ext: "CSH", name: "Cubase Waveform File" }, { ext: "MINIUSF", name: "Nintendo 64 Song File" },
  { ext: "FDP", name: "FMOD Project File" }, { ext: "OVE", name: "Overture Musical Score" },
  { ext: "VRF", name: "Ventrilo Audio Recording" }, { ext: "DMF", name: "Delusion Digital Music File" },
  { ext: "SND", name: "Akai MPC Sample" }, { ext: "XMF", name: "Extensible Music File" },
  { ext: "SBK", name: "E-MU SoundFont Sound Bank" }, { ext: "IMP", name: "Audition Impulse File" },
  { ext: "JAM", name: "Line 6 Device Recording" }, { ext: "MTS", name: "MadTracker 2 Sample File" },
  { ext: "R1M", name: "RealOne Streaming Media File" }, { ext: "ADG", name: "Ableton Device Group" },
  { ext: "5XS", name: "Line 6 POD HD500X Edit Setlist File" }, { ext: "SMPX", name: "SmartMusic Accompaniment File" },
  { ext: "OVW", name: "Cubase WAVE Overview File" }, { ext: "PRG", name: "WAVmaker Patch File" },
  { ext: "PJUNOXL", name: "Preset File" }, { ext: "RVX", name: "Real Protected Video File" },
  { ext: "RBS", name: "MP3 Ringtone File" }, { ext: "PSY", name: "Psycle Song File" },
  { ext: "VTX", name: "VTX Chiptune File" }, { ext: "BANK", name: "FMOD Audio Bank" },
  { ext: "MTE", name: "MadTracker 2 Envelope" }, { ext: "SPX", name: "Ogg Vorbis Speex File" },
  { ext: "SFAP0", name: "Sound Forge Pro Audio Proxy File" }, { ext: "DCM", name: "DCM Audio Module" },
  { ext: "SND", name: "Sound File" }, { ext: "TTA", name: "True Audio File" },
  { ext: "VOC", name: "Creative Labs Audio File" }, { ext: "SCS11", name: "Show Cue System Cue File" },
  { ext: "STX", name: "Scream Tracker Music Interface Kit File" }, { ext: "A2I", name: "Adlib Tracker II Instrument File" },
  { ext: "BAP", name: "Blaze Audio Wave Information File" }, { ext: "USF", name: "Nintendo 64 Music File" },
  { ext: "USFLIB", name: "Nintendo 64 Song Library" }, { ext: "MGV", name: "Yamaha MegaVoice File" },
  { ext: "KFN", name: "KaraFun Karaoke File" }, { ext: "NKB", name: "Kontakt Audio Bank" },
  { ext: "SPRG", name: "Synclavier Program File" }, { ext: "KPL", name: "Kazaa Playlist File" },
  { ext: "HDP", name: "MAGIX Hard Disk Project Audio File" }, { ext: "PPC", name: "Adobe Presenter Audio File" },
  { ext: "S3Z", name: "Compressed Scream Tracker 3 Module" }, { ext: "TXW", name: "Yamaha TX16W Audio File" },
  { ext: "EXS", name: "EXS Instrument" }, { ext: "PTCOP", name: "PxTone Composer Project" },
  { ext: "SES", name: "Audition Session (Legacy)" }, { ext: "NTN", name: "NOTION Score" },
  { ext: "ADTS", name: "Audio Data Transport Stream File" }, { ext: "SD2F", name: "Sound Designer 2 File" },
  { ext: "EXPRESSIONMAP", name: "Cubase Expression Map File" }, { ext: "EMP", name: "eMusic Music Download File" },
  { ext: "RBS", name: "Rebirth Song File" }, { ext: "VMO", name: "Siemens Voice Memo File" },
  { ext: "AMS", name: "Extreme Tracker Module" }, { ext: "WFD", name: "WaveFront Drum Kit File" },
  { ext: "SND", name: "Macintosh Sound Resource" }, { ext: "G723", name: "G.723 ADPCM Audio" },
  { ext: "SFS", name: "SFX Sample File" }, { ext: "NARRATIVE", name: "Narrator Document" },
  { ext: "SD2", name: "Sound Designer II File" }, { ext: "JSPF", name: "JSON Playlist File" },
  { ext: "RAX", name: "Real Music Store Audio File" }, { ext: "SVX", name: "8SVX Sound File" },
  { ext: "A2W", name: "Adlib Tracker II Instrument Bank with Macros" }, { ext: "MINIPSF", name: "Miniature PlayStation Sound Format File" },
  { ext: "MINIPSF2", name: "Miniature PlayStation Sound Format File" }, { ext: "AY", name: "AY Chiptune File" },
  { ext: "WTPL", name: "WireTap Studio Library" }, { ext: "OFR", name: "OptimFROG Audio File" },
  { ext: "PBF", name: "Pinnacle Sample Bank" }, { ext: "FFT", name: "Adobe Audition Noise Print File" },
  { ext: "CEL", name: "Audition Loop" }, { ext: "JBX", name: "Microsoft Play It! Music File" },
  { ext: "MSV", name: "Memory Stick Voice File" }, { ext: "A2T", name: "Adlib Tracker II Tiny Module File" },
  { ext: "CPT", name: "DTS Compact Audio File" }
];

const App: React.FC = () => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [engineReady, setEngineReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Booting Studio...');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<FileState[]>([]);

  useEffect(() => { filesRef.current = files; }, [files]);

  useEffect(() => {
    loadFFmpeg(setStatusMessage).then(() => {
      setEngineReady(true);
      setIsInitializing(false);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: FileState[] = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file, name: file.name, size: file.size, type: file.type,
      status: 'idle', progress: 0, outputFormat: 'MP3'
    }));
    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const updateFileStatus = (id: string, updates: Partial<FileState>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const startConversion = async (id: string) => {
    const fileItem = filesRef.current.find(f => f.id === id);
    if (!fileItem || !engineReady || fileItem.status === 'converting') return;
    updateFileStatus(id, { status: 'converting', progress: 0 });
    try {
      if (!fileItem.aiMetadata) {
        analyzeAudioWithAI(fileItem.name, fileItem.size).then(m => updateFileStatus(id, { aiMetadata: m }));
      }
      const result = await convertAudio(fileItem.file, fileItem.outputFormat, p => updateFileStatus(id, { progress: p }));
      updateFileStatus(id, { status: 'completed', progress: 100, outputUrl: result.url, outputName: result.name });
    } catch (e) { updateFileStatus(id, { status: 'error' }); }
  };

  const startAllConversions = async () => {
    const idleFiles = files.filter(f => f.status === 'idle');
    if (idleFiles.length === 0) return;
    
    setIsProcessingAll(true);
    for (const f of idleFiles) {
      await startConversion(f.id);
    }
    setIsProcessingAll(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFormats = ALL_FORMATS.filter(f => 
    f.ext.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 15);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120] p-6">
        <div className="max-w-sm w-full glass-panel rounded-[3rem] p-10 text-center border-sky-500/20 shadow-2xl relative overflow-hidden">
          <Zap className="w-10 h-10 text-sky-400 animate-bounce mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-2">Am-Adu Ready</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">{statusMessage}</p>
          <Loader2 className="w-6 h-6 text-sky-500 animate-spin mx-auto opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-sky-500 p-2 rounded-xl shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter">Am<span className="gradient-text">music</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900/80 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Native Adu Online</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        <section className="mb-12">
            <h2 className="text-5xl sm:text-7xl font-black mb-4 tracking-tighter leading-[0.85]">
              Adu Audio<br />
              <span className="gradient-text">Studio.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mb-10 leading-relaxed font-medium">
              Native conversion across 500+ specialized audio extensions. Zero uploads, infinite precision.
            </p>
            <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-10 py-5 rounded-[2rem] font-black flex items-center gap-4 transition-all shadow-xl hover:bg-slate-200 active:scale-95 uppercase tracking-tighter text-base">
              <Upload className="w-6 h-6" /> UPLOAD AUDIO TO STUDIO
            </button>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="audio/*,video/mp4" onChange={handleFileChange} />
        </section>

        <section className="space-y-4">
          {files.map((f) => (
            <div key={f.id} className={`glass-panel rounded-[2.5rem] p-6 transition-all border-l-8 ${
              f.status === 'completed' ? 'border-emerald-500 bg-emerald-500/5' : f.status === 'converting' ? 'border-sky-500 bg-sky-500/5' : 'border-slate-800'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 flex items-center gap-6">
                  <div className="bg-slate-900 p-5 rounded-2xl border border-white/5 relative">
                    <FileAudio className={`w-10 h-10 ${f.status === 'converting' ? 'text-sky-400 animate-pulse' : 'text-slate-600'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-white truncate text-lg tracking-tighter">{f.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-black uppercase tracking-widest border border-white/5">{formatSize(f.size)}</span>
                      <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">{f.type || 'SYSTEM'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  {f.status === 'idle' && (
                    <div className="relative">
                      <button 
                        onClick={() => setIsFormatMenuOpen(isFormatMenuOpen === f.id ? null : f.id)}
                        className="bg-black/40 px-6 py-3 rounded-2xl border border-white/10 text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-black/60 transition-all"
                      >
                        Target: <span className="text-sky-400">{f.outputFormat}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isFormatMenuOpen === f.id ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isFormatMenuOpen === f.id && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl z-[100] p-4 animate-in fade-in slide-in-from-top-2">
                           <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl mb-4 border border-white/5">
                             <Search className="w-4 h-4 text-slate-500" />
                             <input 
                              type="text" 
                              placeholder="Search 500+ formats..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-transparent border-none text-[11px] font-bold text-white focus:ring-0 w-full"
                             />
                           </div>
                           <div className="max-h-60 overflow-y-auto space-y-1">
                              {filteredFormats.map(fmt => (
                                <button 
                                  key={fmt.ext}
                                  onClick={() => { updateFileStatus(f.id, { outputFormat: fmt.ext }); setIsFormatMenuOpen(null); setSearchQuery(''); }}
                                  className="w-full text-left px-4 py-2 rounded-xl hover:bg-sky-500/10 group transition-all flex items-center justify-between"
                                >
                                  <div>
                                    <div className="text-[10px] font-black text-white group-hover:text-sky-400">.{fmt.ext}</div>
                                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{fmt.name}</div>
                                  </div>
                                  {f.outputFormat === fmt.ext && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                </button>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )}

                  {f.status === 'converting' && (
                    <div className="flex flex-col items-end min-w-[200px]">
                      <div className="flex items-center justify-between w-full mb-2 px-1">
                        <span className="text-[9px] font-black uppercase text-sky-400 tracking-widest animate-pulse">Transcoding</span>
                        <span className="text-xs font-black font-mono text-white">{f.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${f.progress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {f.status === 'completed' && (
                    <a href={f.outputUrl} download={f.outputName} className="bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 group">
                      <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                    </a>
                  )}

                  <div className="flex items-center gap-3">
                    {f.status === 'idle' && (
                      <button onClick={() => startConversion(f.id)} className="bg-white text-black p-4 rounded-2xl hover:bg-slate-200 transition-all shadow-xl">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    )}
                    <button onClick={() => { if (f.outputUrl) URL.revokeObjectURL(f.outputUrl); setFiles(prev => prev.filter(item => item.id !== f.id)); }} disabled={f.status === 'converting'} className="p-4 text-slate-600 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {f.aiMetadata && (
                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Acoustic Archetype</span>
                    <span className="text-xs font-black uppercase text-sky-400 flex items-center gap-2"><Sparkles className="w-3 h-3" /> {f.aiMetadata.genre}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Atmosphere</span>
                    <span className="text-xs text-slate-300 font-medium italic">"{f.aiMetadata.mood}"</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Sonic Insight</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-1">{f.aiMetadata.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </main>

      {files.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
          <div className="glass-panel py-2 px-6 rounded-full shadow-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-6 ml-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Queue: <span className="text-white ml-2 text-base">{files.length}</span></span>
                <div className="h-4 w-[1px] bg-white/10"></div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isProcessingAll ? 'text-sky-400' : 'text-emerald-400'}`}>
                  {isProcessingAll ? 'Engaged' : 'Ready'}
                </span>
            </div>
            <div className="flex items-center gap-4">
               {!isProcessingAll && (
                  <button onClick={() => { files.forEach(f => f.outputUrl && URL.revokeObjectURL(f.outputUrl)); setFiles([]); }} className="text-[8px] font-black text-slate-500 hover:text-white uppercase tracking-widest px-3">Clear</button>
               )}
               <button onClick={startAllConversions} disabled={isProcessingAll} className="bg-sky-500 hover:bg-sky-400 disabled:opacity-30 text-white px-6 py-2 rounded-full font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg uppercase tracking-tighter text-[10px]">
                  {isProcessingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  {isProcessingAll ? 'Processing' : 'Convert All'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
