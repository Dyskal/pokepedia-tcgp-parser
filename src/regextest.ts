const input = '[[Florizarre-ex (Puissance Génétique 004)|Florizarre]]{{Symbole JCC|ex JCCP}}';

console.time('First Regex');
for (let i = 0; i < 1000000; ++i) {
    input.replace(/\[\[(.+?) \(.+/, '$1');
}
console.timeEnd('First Regex');

console.time('Second Replace');
for (let i = 0; i < 1000000; i++) {
    input.replace(/\[\[(.+?\)|.+?)]]/, '$1');
}
console.timeEnd('Second Replace');
