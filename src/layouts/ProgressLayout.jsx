import ResumeLearningModal from "@/components/ResumeLearningModal";
import { SessionProvider } from "@/context/SessionContext";
import { Outlet, useParams } from "react-router-dom";

const ProgressLayout = () => {
  const { character, chapter, method } = useParams();
  // const location = useLocation();

  // 현재 경로에 따라 모달 매개변수 결정
  const getModalProps = () => {
    // const pathSegments = location.pathname.split("/").filter(Boolean);

    // /learn/:character/:chapter/:method (Learn 페이지)
    // if (character && chapter && method) {
    //   console.log("Learn page - showing specific method modal");
    //   return {
    //     characterId: character,
    //     chapterId: chapter,
    //     method: method,
    //     autoShow: true,
    //   };
    // }

    // /learn/:character/:chapter (Method 페이지)
    if (character && chapter && !method) {
      return {
        characterId: character,
        chapterId: chapter,
        autoShow: true,
      };
    }

    // /learn/:character (Target 페이지)
    if (character && !chapter && !method) {
      return {
        characterId: character,
        autoShow: true,
      };
    }

    return null;
  };

  const modalProps = getModalProps();

  return (
    <SessionProvider>
      <Outlet />
      {modalProps && <ResumeLearningModal {...modalProps} />}
    </SessionProvider>
  );
};

export default ProgressLayout;
