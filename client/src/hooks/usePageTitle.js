import { useEffect } from "react";

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | SkillHive` : "SkillHive";
  }, [title]);
};

export default usePageTitle;
