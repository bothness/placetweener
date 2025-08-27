const alphabet = " abcdefghijklmnopqrstuvwxyz";
const lookup = {};
for (let i = 0; i < alphabet.length; i++) lookup[alphabet[i]] = i;

export function linearInterpolator(x, y, a) {
  return x * (1 - a) + y * a;
}

function stringsToArrays(str1, str2) {
  const padStart =
    str1[0] === str2[0]
      ? false
      : str1[str1.length - 1] === str2[str2.length - 1]
      ? true
      : false;
  const len = Math.max(str1.length, str2.length);

  const arr1 = str1.split("");
  while (arr1.length < len) {
    if (padStart) arr1.unshift(" ");
    else arr1.push(" ");
  }
  const arr2 = str2.split("");
  while (arr2.length < len) {
    if (padStart) arr2.unshift(" ");
    else arr2.push(" ");
  }

  return { arr1, arr2, len };
}

export function stringInterpolator(str1, str2, a = 0) {
  a = a < 0 ? 0 : a > 1 ? 1 : a;
  if (a === 0) return str1;
  if (a === 1) return str2;

  const { arr1, arr2, len } = stringsToArrays(str1, str2);

  const arr3 = Array(len);
  for (let i = 0; i < len; i++) {
    const index = Math.round(
      linearInterpolator(lookup[arr1[i]] || 0, lookup[arr2[i]] || 0, a)
    );
    const letter = alphabet[index];
    arr3.push(letter);
  }
  return arr3.join("").trim();
}

export function getMaxOffset(str1, str2) {
  const { arr1, arr2, len } = stringsToArrays(str1, str2);

  let maxOffset = 0;
  for (let i = 0; i < len; i++) {
    const offset = Math.abs((lookup[arr1[i]] || 0) - (lookup[arr2[i]] || 0));
    if (offset > maxOffset) maxOffset = offset;
  }
  return maxOffset || 1;
}
