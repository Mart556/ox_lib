import { useState, useEffect, useRef } from 'react';
import { Box, Text, Progress, Group, Flex } from '@mantine/core';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import ScaleFade from '../../transitions/ScaleFade';
import { IconStopwatch } from '@tabler/icons-react';
import type { ProgressbarProps } from '../../typings';

const Progressbar: React.FC = () => {
  const [duration, setDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [label, setLabel] = useState('');
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const startProgress = () => {
    setTimeLeft(Math.floor(duration / 1000));

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          cancelProgress();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  const cancelProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setVisible(false);
    setTimeLeft(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useNuiEvent('progressCancel', () => setVisible(false));

  useNuiEvent<ProgressbarProps>('progress', (data) => {
    startProgress();
    setLabel(data.label);
    setDuration(data.duration);
    setVisible(true);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'x' || event.key === 'X') {
        cancelProgress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <ScaleFade visible={visible} onExitComplete={() => fetchNui('progressComplete')}>
        <Box
          sx={{
            width: 300,
            position: 'fixed',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: 10,
            borderRadius: 10,

          }}
        >
          <Group position="apart" mb={5}>
            <Text size="md" fw={500} sx={{ textShadow: '1px 1px 1px #222' }}>
              {label}
            </Text>

            <Flex align="center" gap={3}>
              <IconStopwatch size={16} />
              <Text size="md" fw={500} sx={{ textShadow: '1px 1px 1px #222' }}>
                {timeLeft}s
              </Text>
            </Flex>
          </Group>

          <Box
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)', // light green background
              borderRadius: 5,
            }}
          >
            <Progress
              sx={{
                animation: 'progress-bar linear',
                animationDuration: `${duration}ms`,
                animationPlayState: 'running',
                backgroundColor: 'rgb(14, 178, 14)', // light green background
              }}
              onAnimationEnd={() => setVisible(false)}
              radius="md"
              size="lg"
            />
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: 0,
              marginTop: 10,
              cursor: 'pointer',
              fontSize: 12,
              textShadow: '1px 1px 1px #222',
            }}
            onClick={cancelProgress}
          ></Box>
          <Text size="xs" fw={500}>
            Vajuta <Text span c="yellow.5" fw={700}>X</Text> katkestamiseks.
          </Text>
        </Box>
      </ScaleFade>
    </>
  );
};

export default Progressbar;
