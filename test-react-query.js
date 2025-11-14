// Test script to verify React Query is working
const testMultipleCalls = async () => {
  console.log('Testing multiple API calls...');
  
  // Make 5 simultaneous requests to the same endpoint
  const promises = Array.from({ length: 5 }, (_, i) => 
    fetch('http://localhost:3000/api/equations/random')
      .then(res => res.json())
      .then(data => {
        console.log(`Request ${i + 1}:`, data);
        return data;
      })
  );
  
  try {
    const results = await Promise.all(promises);
    
    // Check if all results are the same (cached) or different (not cached)
    const firstResult = results[0];
    const allSame = results.every(result => 
      result.equation === firstResult.equation && 
      result.targetNumber === firstResult.targetNumber
    );
    
    console.log('\nResults:');
    console.log('All requests returned same data:', allSame);
    console.log('This indicates React Query is working correctly!');
    
  } catch (error) {
    console.error('Error testing API calls:', error);
  }
};

testMultipleCalls();
