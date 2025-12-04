import { Button } from "../ui/button";
import { Download, Printer } from "lucide-react";

export function IEPReportHeader({ onPrint, onDownload }) {
  return (
    <>
      {/* 액션 버튼 (인쇄 시 숨김) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="space-x-2">
          <Button variant="outline" onClick={onPrint}>
            <Printer className="w-4 h-4 mr-2" />
            인쇄
          </Button>
          <Button onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            PDF 다운로드
          </Button>
        </div>
      </div>

      {/* 헤더 */}
      <div className="pb-4 text-center border-b-2 border-gray-200">
        <h1 className="text-xl font-bold">개별화 교육 프로그램 보고서</h1>
        <p className="mt-1 text-sm text-gray-600">실시간 학습 데이터 기반</p>
      </div>
    </>
  );
}
