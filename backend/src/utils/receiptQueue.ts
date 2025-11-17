import Queue from 'bull';
import redis from './redis';

// receipt processing queue
export const receiptQueue = new Queue('receipt-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Job data interface
export interface ReceiptProcessingJob {
  receiptId: string;
  userId: string;
  imageUrl: string;
  imagePath: string;
}

// receipt jobs
receiptQueue.process(async (job) => {
  const { receiptId, userId, imageUrl, imagePath } = job.data as ReceiptProcessingJob;

  console.log(`Processing receipt ${receiptId} for user ${userId}`);

  try {
    // Step 1: OCR Processing (Mindee)
    job.progress(20);
    // TODO: Implement Mindee OCR
    // const ocrData = await processOCR(imageUrl);

    // Step 2: Fraud Detection
    job.progress(40);
    // TODO: Implement fraud detection
    // const fraudScore = await detectFraud(imagePath);

    // Step 3: Calculate Earnings
    job.progress(60);
    // const earnings = calculateEarnings(ocrData.total);

    // Step 4: Update Database
    job.progress(80);
    // await updateReceiptStatus(receiptId, 'processed', ocrData, earnings);

    // Step 5: Update User Balance
    job.progress(100);
    // await updateUserBalance(userId, earnings);

    console.log(`Receipt ${receiptId} processed successfully`);

    return {
      success: true,
      receiptId,
      // ocrData,
      // earnings,
    };
  } catch (error: any) {
    console.error(`Error processing receipt ${receiptId}:`, error);
    throw error;
  }
});

// Event listeners
receiptQueue.on('completed', (job, result) => {
  console.log(`✅ Receipt ${job.data.receiptId} processed:`, result);
});

receiptQueue.on('failed', (job, err) => {
  console.error(`❌ Receipt ${job?.data.receiptId} failed:`, err.message);
});

receiptQueue.on('stalled', (job) => {
  console.warn(`⚠️  Receipt ${job.data.receiptId} stalled`);
});

// Helper function to add receipt to queue
export const addReceiptToQueue = async (data: ReceiptProcessingJob) => {
  const job = await receiptQueue.add(data, {
    priority: 1,
  });

  return job.id;
};

// Helper function to get job status
export const getJobStatus = async (jobId: string) => {
  const job = await receiptQueue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress();

  return {
    id: jobId,
    state,
    progress,
    data: job.data,
  };
};

export default receiptQueue;
