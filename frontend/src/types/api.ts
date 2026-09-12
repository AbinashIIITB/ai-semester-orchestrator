export interface FileProcessResult {
  filename: string;
  type: string;
  status: string;
  chunks?: number;
  error?: string;
}

export interface UploadResponse {
  status: string;
  semester_id: string;
  course_id: string;
  files_processed: FileProcessResult[];
}

export interface RoadmapWeek {
  week: number;
  start_date: string;
  end_date: string;
  topics: string[];
  is_holiday: boolean;
  is_midterm: boolean;
}

export interface RoadmapResponse {
  course: { id: string; name: string; code: string };
  semester: { name: string; start: string; end: string };
  total_weeks: number;
  teaching_weeks: number;
  roadmap: RoadmapWeek[];
}

export interface QuizOptionResponse {
  label: string;
  text: string;
}

export interface QuizQuestionResponse {
  question: string;
  options: QuizOptionResponse[];
  correct_answer: string;
  explanation: string;
  source_topic: string;
}

export interface WeeklyPrepResponse {
  week: number;
  topics: string[];
  summary: string;
  quiz: QuizQuestionResponse[];
  quality_passed: boolean;
  retrieval_attempts: number;
}
