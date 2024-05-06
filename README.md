# word-list-trie

An exploration on how much size could be saved by encoding a word list as a trie.

I wanted to generate a random passphrase with English words but was concerned about the added size a list of words would add.

This is not tested for correctness yet, but the preliminary results are interesting. 

It compressed a 2.8M wordlist to 1.24M. After lz compression, that's ~600K -> ~160K.

run:

`npm/yarn/bun run index.ts`
