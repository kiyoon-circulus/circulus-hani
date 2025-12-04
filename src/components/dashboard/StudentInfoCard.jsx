import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { User } from "lucide-react";

export function StudentInfoCard({
  studentName,
  icon,
  reportPeriod,
  currentDate,
}) {
  return (
    <Card>
      <CardHeader className="p-4 bg-gray-50">
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          학생 기본 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
          <div className="items-center space-y-2">
            <p className="flex items-center justify-center w-20 h-20 text-6xl border rounded-full">
              {icon && !isNaN(icon) ? String.fromCodePoint(icon) : "👤"}
            </p>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-medium">이름:</span>
              <span className="ml-2">{studentName}</span>
            </div>
            <div>
              <span className="font-medium">학습 기간:</span>
              <span className="ml-2">{reportPeriod}</span>
            </div>
            {currentDate && (
              <div>
                <span className="font-medium">작성일:</span>
                <span className="ml-2">{currentDate}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
