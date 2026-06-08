import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, Progress, Group, Flex } from '@mantine/core';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import ScaleFade from '../../transitions/ScaleFade';
import { IconStopwatch } from '@tabler/icons-react';
import type { ProgressbarProps } from '../../typings';

const Progressbar: React.FC = () => {
  const [progressState, setProgressState] = useState<{
    duration: number;
    timeLeft: number;
    label: string;
    visible: boolean;
    canCancel?: boolean;
  }>({
    duration: 0,
    timeLeft: 0,
    label: '',
    visible: false,
  });

  const { duration, timeLeft, label, visible } = progressState;
  const intervalRef = useRef<number | null>(null);

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

  const startProgress = useCallback(
    (newDuration: number, newLabel: string, newCanCancel?: boolean) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const calculatedTimeLeft = Math.ceil(newDuration / 1000);

      setProgressState({
        duration: newDuration,
        timeLeft: calculatedTimeLeft,
        label: newLabel,
        visible: true,
        canCancel: newCanCancel,
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
    },
    [cancelProgress]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useNuiEvent('progressCancel', cancelProgress);
  useNuiEvent<ProgressbarProps>('progress', (data) => {
    startProgress(data.duration, data.label, data?.canCancel);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'x' || event.key === 'X') {
        cancelProgress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelProgress]);

  // Clean, borderless floating container
  const floatingContainerStyle = {
    width: 320,
    position: 'fixed' as const,
    bottom: 60,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    pointerEvents: 'none' as const,
  };

  // High shadows applied to text since the background block is gone
  const textLabelStyle = {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 4px 12px rgba(0, 0, 0, 0.6)',
  };

  const timerStyle = {
    color: 'rgba(255, 255, 255, 0.85)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: '13px',
    fontWeight: 600,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)',
  };

  const progressContainerStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 5,
    padding: '3px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.5)',
  };

  const progressStyle = {
    backgroundColor: 'transparent',
    height: 7,
    borderRadius: '2px',
    overflow: 'hidden' as const,

    '& .mantine-Progress-bar': {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      animation: `progress-bar ${duration}ms linear running`,
      background: 'linear-gradient(90deg, #ff4500 0%, #ff7300 100%)',
      borderRadius: '2px',
      boxShadow: '0 0 10px rgba(255, 69, 0, 0.5)',

      // Smooth hardware accelerated overlay
      '&::after': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%)',
        transform: 'translateX(-100%)',
        animation: 'liquid-sweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },

    '@keyframes liquid-sweep': {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
  };

  const keycapStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '5px',
    padding: '2px 6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
  };

  return (
    <ScaleFade visible={visible} onExitComplete={() => fetchNui('progressComplete')}>
      <Box sx={floatingContainerStyle}>
        <Group position="apart" mb={4} px={4}>
          <Text sx={textLabelStyle}>{label}</Text>

          <Flex align="center" gap={5}>
            <IconStopwatch size={14} color="#fff" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))' }} />
            <Text sx={timerStyle}>{timeLeft}s</Text>
          </Flex>
        </Group>

        <Box sx={progressContainerStyle}>
          <Progress
            sx={progressStyle}
            onAnimationEnd={() => {
              setProgressState((prev) => ({ ...prev, visible: false }));
            }}
            value={100}
          />
        </Box>

        {progressState.canCancel && (
          <Flex align="center" justify="center" gap={6} mt={12}>
            <Text size="xs" fw={600} sx={{ color: '#eee', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
              Vajuta
            </Text>
            <Box sx={keycapStyle}>
              <Text
                size="xs"
                fw={800}
                sx={{ color: '#ffb300', fontSize: '11px', fontFamily: 'monospace', lineHeight: 1 }}
              >
                X
              </Text>
            </Box>
            <Text size="xs" fw={600} sx={{ color: '#eee', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
              katkestamiseks
            </Text>
          </Flex>
        )}
      </Box>
    </ScaleFade>
  );
};

export default Progressbar;
