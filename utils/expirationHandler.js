import schedule from 'node-schedule';
import { client } from '../db/index.js';

export function setupExpirationJob() {
  // Run every hour to check for expired images
  const job = schedule.scheduleJob('0 * * * *', async function() {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      // Get expired images
      const result = await client.execute({
        sql: `
          SELECT id FROM images 
          WHERE expiration > 0 AND (time + expiration) < ?
        `,
        args: [now]
      });
      
      // Delete expired images
      for (const row of result.rows) {
        await client.execute({
          sql: `DELETE FROM images WHERE id = ?`,
          args: [row.id]
        });
        console.log(`Deleted expired image: ${row.id}`);
      }
      
    } catch (error) {
      console.error('Error checking expired images:', error);
    }
  });
  
  console.log('Expiration job scheduled');
  return job;
}
