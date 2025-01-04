import { useEffect, useState } from "react";
import { throttle } from "lodash";

const usePositionScreen = ({ threshold = 0 }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollY(window.scrollY);
      setIsScrolled(window.scrollY > threshold);
    }, 100);

    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove event listener and cancel throttled function
    return () => {
      window.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, [threshold]);

  return { isScrolled, scrollY };
};

export default usePositionScreen;