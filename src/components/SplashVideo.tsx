import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface SplashVideoProps {
  onFinish: () => void;
}

export default function SplashVideo({ onFinish }: SplashVideoProps) {
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const player = useVideoPlayer(require('../../assets/splash.mp4'), (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    const ended = player.addListener('playToEnd', () => onFinishRef.current());
    const status = player.addListener('statusChange', ({ status }) => {
      if (status === 'error') onFinishRef.current();
    });
    return () => {
      ended.remove();
      status.remove();
    };
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  video: {
    flex: 1,
  },
});