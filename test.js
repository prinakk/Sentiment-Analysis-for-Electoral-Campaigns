let tempMarkers = {};
let textarray = 'a b c d d w s a'.split(' ');
tempMarkers = textarray.reduce(function(result, item) {
  result[item + ''] = result[item + ''] || {};
  let tempPbj = result[item + ''];
  tempPbj.count = tempPbj.count || 0;
  tempPbj.count++;
  return result;
}, {});

const result = [];

Object.keys(tempMarkers).forEach(key => {
  result.push({ text: key, count: tempMarkers[key].count });
});
console.log('result', result);
