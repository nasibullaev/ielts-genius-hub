import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LevelCheckerService } from './level-checker.service';
import { SpeechToTextService } from './services/speech-to-text.service';
import { SubmitEssayDto } from './dto/submit-essay.dto';
import {
  SubmitWritingTask1Dto,
  WritingTask1ResponseDto,
} from './dto/writing-task1.dto';
import {
  SubmitListeningDto,
  ListeningResponseDto,
  ListeningEvaluationResponseDto,
} from './dto/listening.dto';
import {
  SubmitReadingDto,
  ReadingResponseDto,
  ReadingEvaluationResponseDto,
} from './dto/reading.dto';
import {
  SubmitSpeakingDto,
  SpeakingResponseDto,
  SpeakingEvaluationResponseDto,
} from './dto/speaking.dto';

// Response DTOs for Swagger
export class TopicResponseDto {
  @ApiProperty({
    example:
      'Some people believe that universities should require every student to take a variety of courses outside their major field of study. Others believe that universities should not force students to take any courses other than those that will help prepare them for jobs in their chosen fields. Discuss both views and give your own opinion.',
  })
  topic: string;
}

export class EvaluationResponseDto {
  @ApiProperty({ example: '6.5' })
  overallBand: string;

  @ApiProperty({ example: '6' })
  taskAchievement: string;

  @ApiProperty({ example: '7' })
  coherenceCohesion: string;

  @ApiProperty({ example: '6' })
  lexicalResource: string;

  @ApiProperty({ example: '7' })
  grammaticalRange: string;

  @ApiProperty({
    example:
      'Your essay demonstrates good understanding of the topic with clear arguments...',
  })
  feedback: string;

  @ApiProperty({
    example: [
      'Use more varied vocabulary',
      'Work on paragraph transitions',
      'Include more specific examples',
    ],
  })
  suggestions: string[];
}

@ApiTags('level-checker')
@Controller('level-checker')
export class LevelCheckerController {
  constructor(
    private readonly levelCheckerService: LevelCheckerService,
    private readonly speechToTextService: SpeechToTextService,
  ) {}

  // Writing Task 2 endpoints
  @Get('writing-2')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Writing Task 2 topic',
    description:
      'Generates a personalized IELTS Writing Task 2 topic based on user interests',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing Task 2 topic generated successfully',
    type: TopicResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 400, description: 'Failed to generate topic' })
  async getWritingTask2Topic(@Request() req) {
    return this.levelCheckerService.generateWritingTask2Topic(req.user.sub);
  }

  @Post('writing-2')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit Writing Task 2 essay for evaluation',
    description:
      'Evaluates the submitted Writing Task 2 essay using Gemini AI and saves the submission to database',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing Task 2 essay evaluated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or evaluation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async submitWritingTask2Essay(
    @Request() req,
    @Body() submitEssayDto: SubmitEssayDto,
  ) {
    return this.levelCheckerService.evaluateWritingTask2Essay(
      req.user.sub,
      submitEssayDto.topic,
      submitEssayDto.essay,
      submitEssayDto.timeSpent,
    );
  }

  // Writing Task 1 endpoints
  @Get('writing-1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Writing Task 1 topic with chart',
    description:
      'Generates a random IELTS Writing Task 1 topic with AI-generated chart using Chart.js',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing Task 1 topic and chart generated successfully',
    type: WritingTask1ResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 400, description: 'Failed to generate topic' })
  async getWritingTask1Topic(@Request() req) {
    return this.levelCheckerService.generateWritingTask1Topic(req.user.sub);
  }

  @Post('writing-1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit Writing Task 1 response for evaluation',
    description:
      'Evaluates the submitted Writing Task 1 response using Gemini AI and saves the submission to database',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing Task 1 response evaluated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or evaluation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async submitWritingTask1Essay(
    @Request() req,
    @Body() submitWritingTask1Dto: SubmitWritingTask1Dto,
  ) {
    return this.levelCheckerService.evaluateWritingTask1Essay(
      req.user.sub,
      submitWritingTask1Dto.question,
      submitWritingTask1Dto.imageUrl,
      submitWritingTask1Dto.taskType,
      submitWritingTask1Dto.answer,
      submitWritingTask1Dto.timeSpent,
    );
  }

  // Listening endpoints
  @Get('listening')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Listening test with text and questions',
    description:
      'Generates a personalized IELTS Listening test with text and questions based on user interests',
  })
  @ApiResponse({
    status: 200,
    description: 'Listening test generated successfully',
    type: ListeningResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to generate listening test',
  })
  async getListeningTest(@Request() req) {
    return this.levelCheckerService.generateListeningTopic(req.user.sub);
  }

  @Post('listening')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit Listening test answers for evaluation',
    description:
      'Evaluates the submitted Listening test answers against the stored correct answers and provides detailed feedback with IELTS band score',
  })
  @ApiResponse({
    status: 200,
    description: 'Listening test evaluated successfully',
    type: ListeningEvaluationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error, test not found, or evaluation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async submitListeningAnswers(
    @Request() req,
    @Body() submitListeningDto: SubmitListeningDto,
  ) {
    return this.levelCheckerService.evaluateListeningAnswers(
      req.user.sub,
      submitListeningDto.testId,
      submitListeningDto.userAnswers,
      submitListeningDto.timeSpent,
    );
  }

  // Reading endpoints
  @Get('reading')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Reading test with passage and questions',
    description:
      'Generates a personalized IELTS Reading test with passage and questions based on user interests',
  })
  @ApiResponse({
    status: 200,
    description: 'Reading test generated successfully',
    type: ReadingResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to generate reading test',
  })
  async getReadingTest(@Request() req) {
    return this.levelCheckerService.generateReadingTopic(req.user.sub);
  }

  @Post('reading')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit Reading test answers for evaluation',
    description:
      'Evaluates the submitted Reading test answers against the stored correct answers and provides detailed feedback with IELTS band score',
  })
  @ApiResponse({
    status: 200,
    description: 'Reading test evaluated successfully',
    type: ReadingEvaluationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error, test not found, or evaluation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async submitReadingAnswers(
    @Request() req,
    @Body() submitReadingDto: SubmitReadingDto,
  ) {
    return this.levelCheckerService.evaluateReadingAnswers(
      req.user.sub,
      submitReadingDto.testId,
      submitReadingDto.userAnswers,
      submitReadingDto.timeSpent,
    );
  }

  // Speaking endpoints
  @Get('speaking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Speaking test with questions',
    description:
      'Generates a personalized IELTS Speaking test with questions based on user interests',
  })
  @ApiResponse({
    status: 200,
    description: 'Speaking test generated successfully',
    type: SpeakingResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to generate speaking test',
  })
  async getSpeakingTest(@Request() req) {
    return this.levelCheckerService.generateSpeakingTopic(req.user.sub);
  }

  @Post('speaking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('audioFiles', 3)) // Allow up to 3 audio files
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Submit Speaking test audio files for evaluation',
    description:
      'Converts audio files to text using speech-to-text, then evaluates the transcribed responses using AI and provides detailed feedback with IELTS band score',
  })
  @ApiResponse({
    status: 200,
    description: 'Speaking test evaluated successfully',
    type: SpeakingEvaluationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Validation error, test not found, audio processing failed, or evaluation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async submitSpeakingAnswers(
    @Request() req,
    @Body() submitSpeakingDto: SubmitSpeakingDto,
    @UploadedFiles() audioFiles: Express.Multer.File[],
  ) {
    // Validate audio files
    if (!audioFiles || audioFiles.length === 0) {
      throw new BadRequestException('No audio files provided');
    }

    if (audioFiles.length !== 3) {
      throw new BadRequestException('Exactly 3 audio files are required');
    }

    // Validate each audio file
    for (const audioFile of audioFiles) {
      if (!this.speechToTextService.validateAudioFile(audioFile)) {
        throw new BadRequestException(
          `Invalid audio file: ${audioFile.originalname}. Supported formats: WAV, MP3, OGG, WEBM, FLAC, M4A. Max size: 10MB`,
        );
      }
    }

    // Convert audio files to text
    const userAnswers =
      await this.speechToTextService.convertMultipleAudioToText(audioFiles);

    // Check if any transcription failed
    const failedTranscriptions = userAnswers.filter((answer) => answer === '');
    if (failedTranscriptions.length > 0) {
      throw new BadRequestException(
        `Failed to transcribe ${failedTranscriptions.length} audio file(s). Please ensure the audio is clear and contains speech.`,
      );
    }

    return this.levelCheckerService.evaluateSpeakingAnswers(
      req.user.sub,
      submitSpeakingDto.testId,
      userAnswers,
      submitSpeakingDto.timeSpent,
    );
  }
}
