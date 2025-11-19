import { Box, createStyles, Text } from '@mantine/core';
import React from 'react';

const useStyles = createStyles((theme) => ({
  container: {
    textAlign: 'center',
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    height: '12.037vh',
    width: '30.5556vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    paddingTop: '0.5556vh',
    fontSize: '1.35vh',
    fontWeight: 600,
    color: '#FFF',
    fontFamily: 'Inter',
  },
}));

const Header: React.FC<{ title: string }> = ({ title }) => {
  const { classes } = useStyles();

  return (
    <>
      <Box className={classes.container}>
        <Text className={classes.heading}>{title}</Text>
        <Text className={'menuDesc2'}>The most beautiful menu you could ever see, with plenty of options..</Text>
      </Box>
    </>
  );
};

export default React.memo(Header);
