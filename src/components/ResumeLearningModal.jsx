/* eslint-disable react-hooks/exhaustive-deps */
import { useSessionStore } from "@/hook/useSessionStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { X, Circle, RefreshCcw } from "lucide-react";
import { TARGETS, METHODS } from "@/utils/globals";

const ResumeLearningModal = ({
  chapterId,
  characterId,
  method,
  autoShow = true, // 자동으로 모달을 보여줄지 여부
}) => {
  const { getAllProgress, clearSessionFor } = useSessionStore();
  const [open, setOpen] = useState(false);
  const [lastSession, setLastSession] = useState(null);
  const navigate = useNavigate();

  // 학습 기록에서 적절한 세션 찾기
  const findRelevantSession = () => {
    const all = getAllProgress();
    if (all.length === 0) return null;

    let relevantSessions = [];

    if (characterId && chapterId && method) {
      // 특정 캐릭터, 챕터, 메서드에 대한 학습 기록
      relevantSessions = all.filter(
        (item) =>
          item?.character === characterId &&
          item?.chapterId === chapterId &&
          item?.method === method
      );
      console.log("Found sessions for specific method:", relevantSessions);
    } else if (characterId && chapterId) {
      // 특정 캐릭터, 챕터에 대한 학습 기록
      relevantSessions = all.filter(
        (item) =>
          item?.character === characterId && item?.chapterId === chapterId
      );
      console.log("Found sessions for chapter:", relevantSessions);
    } else if (characterId) {
      // 특정 캐릭터에 대한 학습 기록
      relevantSessions = all.filter((item) => item?.character === characterId);
      console.log("Found sessions for character:", relevantSessions);
    } else {
      // 전체 학습 기록 중 가장 최근
      relevantSessions = all;
      console.log("Using all sessions:", relevantSessions);
    }

    // 가장 최근 학습 기록 반환 (updatedAt 기준)
    const mostRecent = relevantSessions.length > 0 ? relevantSessions[0] : null;
    console.log("Most recent session:", mostRecent);

    // 세션이 있지만 현재 페이지와 맞지 않는 경우 로그 출력
    if (mostRecent) {
      const isMatching =
        mostRecent.character === characterId &&
        (!chapterId || mostRecent.chapterId === chapterId) &&
        (!method || mostRecent.method === method);

      if (!isMatching) {
        console.warn("Found session but it doesn't match current page:", {
          found: mostRecent,
          current: { characterId, chapterId, method },
        });
      }
    }

    return mostRecent;
  };

  // 수동으로 모달을 열 수 있는 함수 (디버깅용)
  const showModal = () => {
    const session = findRelevantSession();
    if (session) {
      setLastSession(session);
      setOpen(true);
    }
  };

  // 디버깅을 위해 전역에 함수 노출
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.debugResumeModal = {
        showModal,
        findRelevantSession,
        currentProps: { characterId, chapterId, method },
      };
    }
  }, [characterId, chapterId, method]);

  useEffect(() => {
    if (autoShow) {
      const session = findRelevantSession();
      if (session) {
        setLastSession(session);
        setOpen(true);
      }
    }
  }, [characterId, chapterId, method, autoShow]);

  const onCancel = () => {
    setOpen(false);
  };

  const onRestart = () => {
    if (lastSession) {
      const { chapterId: sessionChapterId, method: m } = lastSession;
      clearSessionFor(sessionChapterId, m);
    }
    setOpen(false);
  };

  const onResume = () => {
    if (lastSession) {
      const { character, chapterId: sessionChapterId, method: m } = lastSession;
      navigate(`/learn/${character}/${sessionChapterId}/${m}`);
    }
    setOpen(false);
  };

  if (!open || !lastSession) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="backdrop-blur bg-white/95" />
      <DialogContent className="min-w-[340px] md:min-w-[480px] max-w-4xl py-12 px-8 md:px-16 rounded-3xl shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="mb-6 text-3xl font-extrabold text-center md:text-4xl">
            이전 학습을 이어하시겠습니까?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-2xl text-center md:text-3xl">
          {`${TARGETS[lastSession.target]} - ${
            METHODS[lastSession.method]
          } - "${lastSession.letter}" 학습`}
        </DialogDescription>
        <DialogFooter className="flex flex-row gap-6 justify-center mt-8">
          <Button
            type="button"
            variant="outline"
            className="flex gap-2 justify-center items-center w-40 h-24 text-2xl font-bold rounded-2xl"
            onClick={onCancel}
          >
            <X className="!w-[1em] !h-[1em]" strokeWidth={2.5} />
            <span>닫기</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex gap-2 justify-center items-center w-40 h-24 text-2xl font-bold tracking-tighter rounded-2xl"
            onClick={onRestart}
            autoFocus
          >
            <RefreshCcw className="!w-[1em] !h-[1em]" strokeWidth={2.5} />
            <span className="">새로 시작</span>
          </Button>
          <Button
            type="button"
            className="flex gap-2 justify-center items-center w-40 h-24 text-2xl font-bold rounded-2xl"
            onClick={onResume}
            autoFocus
          >
            <Circle className="!w-[1em] !h-[1em]" strokeWidth={2.5} />
            <span>이어하기</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeLearningModal;
