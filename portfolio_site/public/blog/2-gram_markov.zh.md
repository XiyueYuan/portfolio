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
所谓 2-gram Markov Chain（最基础的 Markov Chain的形式），即：要预测当前单词$w_{t}$，只依赖于它前面的一个单词$w_{t - 1}$，于是我们举个例子，随机从Taylor Swift歌里抽取几句歌词，可以得到以下的结果。

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
我们现在看的是 2-gram 形式，假设我们只处理一句文本

- "I love you happy birthday"

在 2-gram 的形式下，我们记单词数量为$N$，n-gram 的数量为 $n$, 那么我们有`key: {I, love, you, happy, birthday}`五个，由于是看后一个单词，那么最后一个`birthday`就可以pop掉，那么就剩四个。

在 3-gram 的形势下，我们有`key: {I love, love you, you happy, happy birthday}`四个，同理，pop掉最后一个，也就是三个。

那么我们就可以得到 key 的数量为 $N - (n - 1)$

用代码实现一下 2-gram 的：

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
Generalize 一下，n-gram 的用个滑动窗口迭代器来实现：

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

继续往下挖掘：
对于每一个 key 来说，他预测的值都有一个概率，举个例子

```python
'[START]': {
    "They're": 3,
    'The': 1,
    'Blitzkrieg': 2,
    'They': 1,
    "Pulsatin'": 1},`
```
这里 They're 出现了三次，The 出现了一次，以此类推。那么是不是可以用概率来推断根据这一个词，下面出现每个词的概率。先给字典 key 排个序以防乱掉，然后想象一个横轴$(0, 1)$，每一段代表那个单词出现的概率。
我们可以得到：
```python
"""
[('Blitzkrieg', 0, 0.25), 
("Pulsatin'", 0.25, 0.375),
('The', 0.375, 0.5), 
('They', 0.5, 0.625), 
("They're", 0.625, 1.0)]
"""
```
于是我们就可以每次取一个随机数，来看下一个单词是啥。
确保训练集够大，那么这个语言模型将会够精准。


*2025.11.14*
*写于芝加哥大学Reg图书馆二楼右边Row 2/Col 1的cubic里*