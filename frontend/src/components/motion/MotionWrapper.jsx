import { LazyMotion, domAnimation } from 'framer-motion';

const MotionWrapper = ({ children }) => {
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  );
};

export default MotionWrapper;

