function maxTaskAssign(tasks: number[], workers: number[], pills: number, strength: number) {
   workers = workers.sort((a, b) => { return b - a });
   tasks = tasks.sort((a, b) => { return b - a });
   let taskCompletedIndexes = new Set();

   let taskCompleted = 0;
   let lastWorkerIndex = 0;

   for (let i = 0; i < tasks.length; i++) {
      const taskRequirement = tasks[i];
      const workerStrength = workers[lastWorkerIndex];

      if (workerStrength >= taskRequirement) {
         taskCompleted++;
         lastWorkerIndex++;
         taskCompletedIndexes.add(i);
         console.log(`go next worker at ${i}`);
      }
   }

   // console.log({ taskCompletedIndexes })

   for (let i = 0; i < tasks.length; i++) {
      const taskRequirement = tasks[i];
      const workerStrength = workers[lastWorkerIndex];

      if (!taskCompletedIndexes.has(i) && pills > 0 && workerStrength + strength >= taskRequirement) {
         console.log(`use pill at ${lastWorkerIndex}`);
         pills--;
         taskCompleted++;
         lastWorkerIndex++;
      }
   }

   return taskCompleted;
}