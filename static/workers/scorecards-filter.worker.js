// TODO this websworker should be compiled
// from a typescript file within the svelte app
onmessage = function(event){
  try{
    const {scorecards, input} = event.data
    console.log('GrapeVine : running worker : scorecards-filter : ',input)
    filterBigArray(scorecards, (scorecard)=>{
      return true &&
        (!input.score || ((scorecard.score || 0 ) > 0 && input.score >= (scorecard.score || 0))) &&
        (!input.dos || input.dos == scorecard.input?.dos) &&
        (!input.followedby || input.followedby >= (scorecard.input?.count['nostr-follows'] || 0)) &&
        (!input.mutedby || input.mutedby >= (scorecard.input?.count['nostr-mutes'] || 0)) &&
        (!input.reportedby || input.reportedby >= (scorecard.input?.count['nostr-reports'] || 0))
    }).then((filtered)=>{
      postMessage(filtered)
    })
  }catch(e){
    console.log('GrapeVine : error running worker : scorecards-filter : ',e)
  }
}


async function filterBigArray(bigarray, predicate, thisArg, max = 1000) {
  const filtered = []
  const slices = await sliceBigArray(bigarray, max)
  for(let s in slices){ 
      await new Promise( (resolve) => {
        setTimeout( () => { resolve(
          slices[s].filter(predicate,thisArg)
        )}, 0 )
      })
      .then((subset)=> filtered.push(...subset))
      .catch((e)=> console.log('GrapeRank : ERROR processing filterBigArray : ',e))
  }
  return filtered
}

async function sliceBigArray(array, max = 1000){
  if(array.length <= max ) return [array]
  let sliced  = []
  let slicestart = 0
  let sliceend = max
  while(slicestart < array.length){
    await new Promise( (resolve) => {
      setTimeout( () => { 
        resolve(array.slice(slicestart,sliceend)) 
      }, 0 )
    })
    .then((subset)=> sliced.push(subset))
    .catch((e)=> console.log('GrapeRank : ERROR processing sliceBigArray : ',e))
    slicestart = sliceend
    sliceend = slicestart+max
  }
  return sliced
}