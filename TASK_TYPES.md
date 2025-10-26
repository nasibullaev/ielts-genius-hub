# Task Types Implementation

This document describes the new task system for lessons in the IELTS Genius Hub application.

## Overview

The lessons system now supports multiple task types beyond simple quizzes. Each lesson can contain multiple tasks of different types, allowing for rich, interactive learning experiences.

## Supported Task Types

### 1. **Lead-in**

Warm-up activity or discussion prompt

- Fields: `textPrompt`, `imageUrl`

### 2. **Listening (Audio + MCQ)**

Play audio and choose answer

- Fields: `audioUrl`, `options[]`, `correctOptionIndex`

### 3. **Recording (Speaking Prompt)**

Display question; learner records answer

- Fields: `promptText`, `maxDuration`, `sampleAnswerAudioUrl`
- Submission: Audio URL

### 4. **Matching**

Match phrases, words, or meanings

- Fields: `pairs[]`, `correctPairs[]`
- Submission: Array of `[leftIndex, rightIndex]` pairs

### 5. **Ranking**

Rank items by frequency, importance, etc.

- Fields: `items[]`, `correctOrder[]`
- Submission: Ordered array of indices

### 6. **Fill-in-the-Blank**

Complete sentences using a word bank

- Fields: `textTemplate`, `wordBank[]`, `correctAnswers`
- Submission: Map of `position -> word`

### 7. **Multiple Choice (Reading)**

Choose one or more correct answers

- Fields: `questionText`, `options[]`, `correctOptionIndices[]` (multiple)
- Submission: Array of selected option indices

### 8. **True/False**

Mark statements as true or false

- Fields: `statements[]`, `correctFlags[]`
- Submission: Array of boolean values

### 9. **Summary (Cloze)**

Fill in missing words from summary paragraph

- Fields: `paragraphTemplate`, `correctWords`
- Submission: Map of `position -> word`

### 10. **Drag-and-Drop (Categorization)**

Drag items into categories

- Fields: `categories[]`, `items[]`, `correctMapping`
- Submission: Map of `category -> [items]`

### 11. **Paraphrase (Typing Input)**

Rewrite sentence in another way

- Fields: `baseSentence`, `modelAnswer`
- Submission: Text string (manual review)

### 12. **Sentence Reordering**

Reorder phrases into correct sequence

- Fields: `segments[]`, `correctOrder[]`
- Submission: Ordered array of segment indices

### 13. **Speaking – Part 2 Cue Card**

Show topic card for 1–2 minute response

- Fields: `cueCardText`, `notesHint[]`, `sampleAnswerAudioUrl`
- Submission: Audio URL

### 14. **Speaking – Part 3 Discussion**

Display abstract question for extended answer

- Fields: `questionText`, `keyPoints[]`, `modelAnswer`
- Submission: Audio URL

## API Endpoints

### Get Lesson with Tasks

```
GET /api/lessons/:id
```

Returns lesson content including all tasks (without correct answers).

### Submit Tasks

```
POST /api/lessons/:id/tasks
Body: {
  submissions: [
    {
      taskId: "task_id",
      submission: {
        // Task-specific submission data
      }
    }
  ]
}
```

Returns:

- `overallScore`: Overall percentage score
- `correctAnswers`: Number of correct answers
- `totalQuestions`: Total number of scored questions
- `results`: Array of individual task results
- `message`: Score summary message

## Task Evaluation

Different task types have different evaluation strategies:

### Automatic Scoring

- Multiple Choice
- Matching
- Ranking
- Fill-in-the-Blank
- True/False
- Drag-and-Drop
- Sentence Reordering

### Manual Review Required

- Paraphrase
- Recording/Speaking tasks
- Lead-in (typically not scored)

## Example Usage

### Creating a Task

```typescript
{
  lessonId: ObjectId,
  type: "Multiple Choice (Reading)",
  order: 1,
  title: "Reading Comprehension",
  questionText: "What is the main idea of the passage?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctOptionIndices: [0] // Can be multiple for multiple choice
}
```

### Submitting a Task

```typescript
{
  taskId: "task_123",
  submission: {
    type: "Multiple Choice",
    selectedOptions: [0]
  }
}
```

## Database Schema

All tasks are stored in the `tasks` collection with the following structure:

- `lessonId`: Reference to parent lesson
- `type`: Task type enum
- `order`: Display order
- `title`, `description`: Optional metadata
- Task-specific fields based on type

## Admin Endpoints (CRUD)

### Create Task

```
POST /api/admin/tasks
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body:
  - files: Image or audio files (optional, max 10MB each)
  - data: JSON string of CreateTaskDto

Note: Image and audio files are uploaded using multipart/form-data.
The API returns URLs to the uploaded files.
```

### Get Tasks in Lesson

```
GET /api/admin/lessons/:lessonId/tasks
Authorization: Bearer <admin_token>
```

### Update Task

```
PUT /api/admin/tasks/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body:
  - files: Image or audio files (optional, max 10MB each)
  - data: JSON string of UpdateTaskDto (all fields optional)
```

### Delete Task

```
DELETE /api/admin/tasks/:id
Authorization: Bearer <admin_token>
```

## File Uploads

When creating or updating tasks that require images or audio:

1. Use `multipart/form-data` content type
2. Upload files using the `files` field (array of files)
3. Send task data as JSON string in the `data` field
4. Files are automatically stored in `uploads/tasks/` directory
5. Only the file URLs are saved to the database and returned to users

**Supported file types:**

- Images: JPEG, JPG, PNG, WebP (max 5MB)
- Audio: MP3, WAV, OGG, WebM (max 10MB)

**File URLs format:**

- Images: `/uploads/tasks/task-image-{timestamp}-{random}.ext`
- Audio: `/uploads/tasks/task-audio-{timestamp}-{random}.ext`

## Notes

- Tasks are automatically hidden from users until lesson retrieval
- Correct answers are never sent to the client during lesson fetch
- Speaking and paraphrasing tasks typically require manual review
- All tasks are evaluated and scored where applicable
- Activity is logged for progress tracking
- Admin endpoints require JWT authentication with admin privileges
- Uploaded files are served as static assets from `/uploads/tasks/` path
