import { Injectable, BadRequestException } from '@nestjs/common';
import { SpeechClient } from '@google-cloud/speech';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SpeechToTextService {
  private speechClient: SpeechClient;

  constructor() {
    // Initialize Google Cloud Speech client
    // Make sure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
    // or the service account key is available
    this.speechClient = new SpeechClient();
  }

  async convertAudioToText(audioFile: Express.Multer.File): Promise<string> {
    try {
      // Read the audio file
      const audioBytes = audioFile.buffer;

      // Configure the request
      const request = {
        audio: {
          content: audioBytes.toString('base64'),
        },
        config: {
          encoding: this.detectAudioEncoding(audioFile.mimetype) as any,
          sampleRateHertz: 16000, // Standard sample rate for speech recognition
          languageCode: 'en-US', // English language
          enableAutomaticPunctuation: true,
          model: 'latest_long', // Use the latest long-form model for better accuracy
        },
      };

      // Perform the speech recognition
      const [response] = await this.speechClient.recognize(request);

      if (!response.results || response.results.length === 0) {
        throw new BadRequestException('No speech detected in audio file');
      }

      // Combine all transcribed text
      const transcription = response.results
        .map((result) => result.alternatives?.[0]?.transcript || '')
        .join(' ')
        .trim();

      if (!transcription) {
        throw new BadRequestException(
          'Could not transcribe audio - no clear speech detected',
        );
      }

      return transcription;
    } catch (error) {
      console.error('Speech-to-text conversion error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Failed to convert audio to text');
    }
  }

  async convertMultipleAudioToText(
    audioFiles: Express.Multer.File[],
  ): Promise<string[]> {
    const transcriptions: string[] = [];

    for (const audioFile of audioFiles) {
      try {
        const transcription = await this.convertAudioToText(audioFile);
        transcriptions.push(transcription);
      } catch (error) {
        console.error(
          `Failed to transcribe audio file ${audioFile.originalname}:`,
          error,
        );
        // Add empty string for failed transcriptions to maintain array order
        transcriptions.push('');
      }
    }

    return transcriptions;
  }

  private detectAudioEncoding(mimetype: string): string {
    switch (mimetype) {
      case 'audio/wav':
      case 'audio/wave':
        return 'LINEAR16';
      case 'audio/mp3':
        return 'MP3';
      case 'audio/mpeg':
        return 'MP3';
      case 'audio/ogg':
        return 'OGG_OPUS';
      case 'audio/webm':
        return 'WEBM_OPUS';
      case 'audio/flac':
        return 'FLAC';
      case 'audio/m4a':
        return 'M4A';
      default:
        // Default to LINEAR16 for WAV files
        return 'LINEAR16';
    }
  }

  validateAudioFile(audioFile: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'audio/wav',
      'audio/wave',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/webm',
      'audio/flac',
      'audio/m4a',
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (!allowedMimeTypes.includes(audioFile.mimetype)) {
      return false;
    }

    if (audioFile.size > maxFileSize) {
      return false;
    }

    return true;
  }
}
