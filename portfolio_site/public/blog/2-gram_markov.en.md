# N-Gram Markov Chain

```python
test.markov_counts([
    ["BB:1:V", "They're forming in a straight line"],
    ["BB:2:V", "They're going through a tight wind"],
    ["BB:3:V", "The kids are losing their minds"],
    ["BB:4:V", "Blitzkrieg Bop"],
    ["BB:5:V", "They're piling in the back seat"],
    ["BB:6:V", "They generate steam heat"],
    ["BB:7:V", "Pulsatin' to the back beat"],
    ["BB:8:V", "Blitzkrieg Bop"]])
```
A 2-gram Markov Chain (the most basic form of a Markov chain in language modeling) assumes that to predict the current word $w_{t}$, we only need to look at the one word $w_{t - 1}$ immediately before it. For example, if we sample a few random lines from Taylor Swift lyrics, we might obtain something like this.

```python
"""
Out[1]: {'[START]': {"They're": 3,
        'The': 1,
        'Blitzkrieg': 2,
        'They': 1,
        "Pulsatin'": 1},
        "They're": {'forming': 1, 'going': 1, 'piling': 1},
        'forming': {'in': 1},
        'in': {'a': 1, 'the': 1},
        'a': {'straight': 1, 'tight': 1},
        'straight': {'line': 1},
        'line': {'[END]': 1},
        'going': {'through': 1},
        'through': {'a': 1},
        'tight': {'wind': 1},
        'wind': {'[END]': 1},
        'The': {'kids': 1},
        'kids': {'are': 1},
        'are': {'losing': 1},
        'losing': {'their': 1},
        'their': {'minds': 1},
        'minds': {'[END]': 1},
        'Blitzkrieg': {'Bop': 2},
        'Bop': {'[END]': 2},
        'piling': {'in': 1},
        'the': {'back': 2},
        'back': {'seat': 1, 'beat': 1},
        'seat': {'[END]': 1},
        'They': {'generate': 1},
        'generate': {'steam': 1},
        'steam': {'heat': 1},
        'heat': {'[END]': 1},
        "Pulsatin'": {'to': 1},
        'to': {'the': 1},
        'beat': {'[END]': 1}}
"""
```
We now look at the 2-gram setting and assume we are working with a single sentence:

- “I love you happy birthday”

In the 2-gram case, let the total number of words be $N$, and let the n-gram size be $n$.  
The keys are `{I, love, you, happy, birthday}`, five in total.  

Since we only use each word to predict the word that follows it, the last word `birthday` has no successor and can be popped off — leaving us with four keys.

In the 3-gram case, the keys become the consecutive pairs:  
`{I love, love you, you happy, happy birthday}`, four in total.  

Again, the last one has no following word and gets popped off, resulting in three keys.

Thus, in general, the number of valid keys is: $N - (n - 1)$

Here is a simple 2-gram implementation:

```python
def two_gram_chain(lyrics):
    res = {}
    for _, line in lyrics:
        line = process_line(line)
        for i in range(len(line) - 1):
            w1 = line[i]
            w2 = line[i + 1]
            if w1 not in res:
                res[w1] = {}
            res[w1][w2] = res[w1].get(w2, 0) + 1
    return res  
```
Generalizing this idea, an n-gram can be implemented using a sliding-window iterator:

```python
def ngram_chain(lyrics, n):
    res = {}
    for _, line in lyrics:
        words = process_line(line)
        for i in range(len(words) - n + 1):
            key = tuple(words[i:i+n-1])  
            value = words[i + n - 1]     
            if key not in res:
                res[key] = {}
            res[key][value] = res[key].get(value, 0) + 1
    return res
```

Digging a bit deeper:  
for each key, every possible next word comes with its own probability. For example:

```python
'[START]': {
    "They're": 3,
    'The': 1,
    'Blitzkrieg': 2,
    'They': 1,
    "Pulsatin'": 1},`
```
Here, *They’re* appears three times and *The* appears once, and so on.  
So we can use these counts to infer the probability of each possible next word given this key.  
We first sort the dictionary entries to keep things stable, and then imagine the interval $(0, 1)$,  
with each segment representing the probability of one of the words.

We obtain something like:
```python
"""
[('Blitzkrieg', 0, 0.25), 
("Pulsatin'", 0.25, 0.375),
('The', 0.375, 0.5), 
('They', 0.5, 0.625), 
("They're", 0.625, 1.0)]
"""
```
With this setup, we can simply draw a random number each time to determine the next word.  
As long as the training set is sufficiently large, the resulting language model will become reasonably accurate.

*2025.11.14*
*Written in the Row 2 / Col 1 cubicle on the right side of the second floor of the Reg, University of Chicago.*
