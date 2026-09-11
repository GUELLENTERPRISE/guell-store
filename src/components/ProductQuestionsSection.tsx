import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProductQuestions, useCreateQuestion, useCreateAnswer } from '@/hooks/useProductQuestions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send } from 'lucide-react';

interface ProductQuestionsSectionProps {
  productId: string;
}

export const ProductQuestionsSection = ({ productId }: ProductQuestionsSectionProps) => {
  const { user } = useAuth();
  const { data: questions, isLoading } = useProductQuestions(productId);
  const createQuestion = useCreateQuestion();
  const createAnswer = useCreateAnswer();
  
  const [newQuestion, setNewQuestion] = useState('');
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [showAnswerForm, setShowAnswerForm] = useState<Record<string, boolean>>({});

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return;
    createQuestion.mutate(
      { productId, question: newQuestion },
      {
        onSuccess: () => {
          setNewQuestion('');
        },
      }
    );
  };

  const handleSubmitAnswer = (questionId: string) => {
    if (!answerText[questionId]?.trim()) return;
    createAnswer.mutate(
      { 
        questionId, 
        answer: answerText[questionId],
        productId 
      },
      {
        onSuccess: () => {
          setAnswerText(prev => ({ ...prev, [questionId]: '' }));
          setShowAnswerForm(prev => ({ ...prev, [questionId]: false }));
        },
      }
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading questions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Customer Questions & Answers</h2>
        <Badge variant="secondary">{questions?.length || 0} Questions</Badge>
      </div>

      {user && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Ask a question</h3>
          <Textarea
            placeholder="Type your question here..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="mb-3"
          />
          <Button 
            onClick={handleSubmitQuestion}
            disabled={createQuestion.isPending || !newQuestion.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            Post Question
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {questions?.map((question) => (
          <Card key={question.id} className="p-4">
            <div className="flex gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={question.user_profiles?.avatar_url} />
                <AvatarFallback>
                  {question.user_profiles?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{question.user_profiles?.full_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground">{question.question}</p>
              </div>
            </div>

            {question.product_answers && question.product_answers.length > 0 && (
              <div className="ml-12 space-y-3 border-l-2 border-border pl-4">
                {question.product_answers.map((answer) => (
                  <div key={answer.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={answer.user_profiles?.avatar_url} />
                      <AvatarFallback>
                        {answer.user_profiles?.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {answer.user_profiles?.full_name}
                        </span>
                        {answer.is_seller && (
                          <Badge variant="default" className="text-xs">Seller</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{answer.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user && (
              <div className="ml-12 mt-3">
                {!showAnswerForm[question.id] ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAnswerForm(prev => ({ ...prev, [question.id]: true }))}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Answer
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your answer..."
                      value={answerText[question.id] || ''}
                      onChange={(e) => setAnswerText(prev => ({ ...prev, [question.id]: e.target.value }))}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitAnswer(question.id)}
                        disabled={createAnswer.isPending || !answerText[question.id]?.trim()}
                      >
                        Submit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAnswerForm(prev => ({ ...prev, [question.id]: false }));
                          setAnswerText(prev => ({ ...prev, [question.id]: '' }));
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {!user && (
        <Card className="p-6 text-center bg-muted/50">
          <p className="text-muted-foreground">Sign in to ask questions and provide answers</p>
        </Card>
      )}
    </div>
  );
};
