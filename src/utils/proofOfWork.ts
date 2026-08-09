/**
 * Generates a cryptographic Proof of Work (PoW) locally.
 * This runs an invisible mathematical challenge in the browser/app before allowing account creation.
 * It protects the local SQLite database from being spammed by automated scripts,
 * without requiring the user to solve annoying CAPTCHAs.
 */

export async function generateProofOfWork(difficulty: number = 4): Promise<string> {
  const challenge = Math.random().toString(36).substring(2);
  let nonce = 0;
  
  // Create a target string of leading zeros (e.g., '0000')
  const target = '0'.repeat(difficulty);
  
  return new Promise((resolve) => {
    const compute = async () => {
      // Process in chunks to avoid blocking the main UI thread completely
      for (let i = 0; i < 1000; i++) {
        const data = challenge + nonce.toString();
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        if (hashHex.startsWith(target)) {
          resolve(`${challenge}:${nonce}:${hashHex}`);
          return;
        }
        nonce++;
      }
      
      // Yield to main thread then continue
      setTimeout(compute, 0);
    };
    
    compute();
  });
}
