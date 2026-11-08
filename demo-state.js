export function demoSelection(search, profiles) {
  const params = new URLSearchParams(search);
  const id = params.get('piece');
  return {
    pieceId: profiles.find(profile => profile.pieceId === id)?.pieceId || profiles.find(profile => profile.pieceId === 'zebra_piece')?.pieceId || profiles[0].pieceId,
    view: params.get('view') === 'scan' ? 'scan' : 'result',
  };
}

export function nextDemoAnimal(profiles, pieceId, direction) {
  const index = profiles.findIndex(profile => profile.pieceId === pieceId);
  return profiles[(Math.max(0, index) + direction + profiles.length) % profiles.length].pieceId;
}
