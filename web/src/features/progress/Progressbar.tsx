import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, Progress, Group, Flex } from '@mantine/core';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import ScaleFade from '../../transitions/ScaleFade';
import { IconStopwatch } from '@tabler/icons-react';
import type { ProgressbarProps } from '../../typings';

const Progressbar: React.FC = () => {
  // Group related state together
  const [progressState, setProgressState] = useState<{
    duration: number;
    timeLeft: number;
    label: string;
    visible: boolean;
  }>({
    duration: 0,
    timeLeft: 0,
    label: '',
    visible: false,
  });
  const { duration, timeLeft, label, visible } = progressState;
  const intervalRef = useRef<number | null>(null);

  // Memoize handlers to prevent unnecessary re-renders
  const cancelProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setProgressState((prev) => ({
      ...prev,
      visible: false,
      timeLeft: 0,
    }));
  }, []);

  const startProgress = useCallback((newDuration: number, newLabel: string) => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const calculatedTimeLeft = Math.floor(newDuration / 1000);

    setProgressState({
      duration: newDuration,
      timeLeft: calculatedTimeLeft,
      label: newLabel,
      visible: true,
    });

    intervalRef.current = window.setInterval(() => {
      setProgressState((prev) => {
        const newTime = prev.timeLeft - 1;

        if (newTime <= 0) {
          cancelProgress();
          return { ...prev, timeLeft: 0 };
        }

        return { ...prev, timeLeft: newTime };
      });
    }, 1000);
  }, [cancelProgress]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle NUI events
  useNuiEvent('progressCancel', cancelProgress);

  useNuiEvent<ProgressbarProps>('progress', (data) => {
    startProgress(data.duration, data.label);
  });

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'x' || event.key === 'X') {
        cancelProgress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelProgress]);

  // Extract styles for better organization
  const containerStyle = {
    width: 300,
    position: 'fixed' as const,
    bottom: 30,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    padding: 10,
    borderRadius: 10,
  };

  const progressContainerStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
  };

  const progressStyle = {
    animation: 'progress-bar linear',
    animationDuration: `${duration}ms`,
    animationPlayState: 'running',
    backgroundColor: 'rgb(14, 178, 14)',
  };

  const textStyle = { textShadow: '1px 1px 1px #222' };

  return (
    <ScaleFade visible={visible} onExitComplete={() => fetchNui('progressComplete')}>
      <Box sx={containerStyle}>
        <Group position="apart" mb={5}>
          <Text size="md" fw={500} sx={textStyle}>
            {label}
          </Text>

          <Flex align="center" gap={3}>
            <IconStopwatch size={16} />
            <Text size="md" fw={500} sx={textStyle}>
              {timeLeft}s
            </Text>
          </Flex>
        </Group>

        <Box sx={progressContainerStyle}>
          <Progress
            sx={progressStyle}
            onAnimationEnd={cancelProgress}
            radius="md"
            size="lg"
          />
        </Box>

        <Box mt={10}>
          <Text size="xs" fw={500} sx={textStyle}>
            Vajuta <Text span c="yellow.5" fw={700}>X</Text> katkestamiseks.
          </Text>
        </Box>
      </Box>
    </ScaleFade>
  );
};

export default Progressbar;