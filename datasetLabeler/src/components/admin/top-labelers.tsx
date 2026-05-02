import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopLabelersProps {
  labelers: Array<{ name: string; count: number }>;
}

export default function TopLabelers({ labelers }: TopLabelersProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getRankBgColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 1:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      case 2:
        return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
      default:
        return 'hover:bg-muted/50';
    }
  };

  const maxCount = labelers.length > 0 ? labelers[0].count : 1;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Top Labelers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {labelers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Belum ada data labeler</p>
          </div>
        ) : (
          <div className="space-y-3">
            {labelers.map((labeler, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${getRankBgColor(index)}`}
              >
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {getRankIcon(index)}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate pr-2">{labeler.name}</p>
                    <p className="text-sm font-bold">{labeler.count}</p>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(labeler.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}