import LZString from 'lz-string'


interface MapInterface {
    [key: string]: Letter | undefined
}

class Letter {
    letter: string = ''
    count: number = 1
    // c: Map<string, l> = new Map<string, l>()
    children: MapInterface = {}

    constructor(letter: string) {
        this.letter = letter
    }
}

function add(root: Letter, chars: string[]) {
    let cur = root
    for (const char of chars) {
        // let next = n.c.get(char)
        let next = cur.children[char]
        if (next) {
            next.count += 1
        } else {
            next = new Letter(char)
            // n.c.set(char, next)
            cur.children[char] = next
        }
        cur = next
    }
}

function build(words: string[]) {
    const root = new Letter('')
    for (const word of words) {
        add(root, [...word])
    }
    return root
}

// I did not yet determine the optimal value for this.
let SER_THRESHOLD = 18

function serialize(children: MapInterface) {
    const num = Object.keys(children).length
    if (num > SER_THRESHOLD) {
        return ser_dense(children)
    } else {
        return ser_sparse(children)
    }
}

function ser_dense(children: MapInterface) {
    let s = '['
    const res = []
    for (const [key, child] of Object.entries(children)) {
        res[letter_to_int(key)] = `${child!.count}${serialize(child!.children)}`
    }
    s += res + ']'
    return s
}

function ser_sparse(children: MapInterface) {
    let s = '{'
    let res: string[] = []
    for (const [key, child] of Object.entries(children)) {
        res.push(`${key}${child!.count}${serialize(child!.children)}`)
    }
    s += res.join(',') + '}'
    return s
}

const base_letter = 'a'.charCodeAt(0)
function letter_to_int(letter: string) {
    return letter.charCodeAt(0) - base_letter
}

function ser2(children: MapInterface) {
    let s = ''
    for (const [letter, child] of Object.entries(children)) {
        s += letter
        // Counts can be calculated after deserialization if desired,
        // so we can save space by leaving counts out
        // if (child!.count > 1) {
        //     s += child!.count
        // }

        // TODO: optimize for unique letter sequences that are not at the end
        const grandchild_count = Object.keys(child!.children).length
        if (child!.count == 1 && grandchild_count == 1) {
            s += concat_all_descendents(child!.children) + '<'
        } else if (grandchild_count > 0) {
            s += '>' + ser2(child!.children)
        }
    }
    s += '<'
    return s
}

function concat_all_descendents(children: MapInterface): string {
    const keys = Object.keys(children)
    if (keys.length === 0) {
        return ''
    } else if (keys.length !== 1) {
        throw new Error('concat_all_descendents: expected one child or none')
    } else {
        const res = keys[0] + concat_all_descendents(children[keys[0]]!.children)
        // console.log('concat_all_descendents:', res)
        return res
    }
}

import fs from 'node:fs';
import wordListPath from 'word-list';
const rawWordList = fs.readFileSync(wordListPath, 'utf8')
const wordList = rawWordList.split('\n');
console.log(`word-list has ${wordList.length} words at ${wordListPath}`);

import { default as safeWordList } from '@nkzw/safe-word-list';
console.log(`safe-word-list has ${safeWordList.length} words`);

function check(wordPerLine: string) { // words: string[]) {
    const words = wordPerLine.split('\n');
    // const s = JSON.stringify(root)
    const slen = wordPerLine.length
    const scomplen = LZString.compress(wordPerLine).length

    const root = build(words)
    const ser = choose_ser(root.children)
    const serlen = ser.length
    const sercomp = LZString.compress(ser)
    const sercomplen = sercomp.length
    console.log(ser.substring(0,20) + '  |  ' + sercomp.substring(0,20))
    console.log(`list: ${slen} -> ${scomplen}, structure: ${serlen} -> ${sercomplen}`)
}

function choose_ser(children: MapInterface) {
    return ser2(children)
}

check(safeWordList.join('\n'))
check(rawWordList)
