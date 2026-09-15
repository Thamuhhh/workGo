import React from 'react';
import { SampleJob } from '../data/sampleJobs';

interface JobMapProps {
  jobs: SampleJob[];
}

// Web never bundles maplibre; the jobs screen uses its radar fallback instead.
export function NativeJobMap(_props: JobMapProps) {
  return null;
}