/**
 * Transformer 3D Lab — Client half.
 *
 * Two ways to look at the same network:
 *   Pipeline — one transformer block opened up in space: tokens → embed → Q·K·V →
 *              attention → mix → FFN → logits, with a real (tiny, seeded) forward
 *              pass behind every number on screen.
 *   Explore  — the whole stack: layers, heads, residual stream, parameter cost.
 *
 * The scene is projected by hand and painted with the 2D canvas API: no WebGL,
 * no 3D library, no external assets.
 */
window.__ModuleLoader__.load({
  id: '@local/transformer-3d-lab',
  factory(require) {
    'use strict';

    const React = require('react');
    const h = React.createElement;

    const NS = 'transformer3d';
    const PANEL_ID = 'transformer-3d-lab';

    /* =====================================================================
     * 0. Locale
     * ===================================================================*/

    const DICT_EN = {
      'app.title': 'Transformer 3D Lab',
      'app.sub': 'One five-token transformer block, opened up in space',
      'app.subExplore': 'The whole stack: layers, heads, residual stream',
      'mode.pipeline': 'Pipeline',
      'mode.explore': 'Explore',
      'missions.chip': 'Missions {n}/5',
      'missions.title': 'Missions',
      'missions.done': 'All missions complete',
      'chip.head': 'Head {n} · {word}',
      'btn.play': 'Play the pipeline',
      'btn.stop': 'Stop',
      'btn.reset': 'Reset view',
      'btn.run': 'Run forward pass',
      'btn.overview': 'Overview',
      'token.title': 'Tokens',
      'token.pick': 'Pick a token',
      'heads.title': 'Attention head',
      'panel.pipeline': 'Pipeline',
      'panel.vector': 'Token vector',
      'panel.legend': 'What you are looking at',
      'panel.structure': 'Structure',
      'panel.display': 'Display',
      'panel.view': 'View',
      'panel.inspect': 'Inspector',
      'step.badge': '{n}/7 · {name}',
      'hint.bar': 'drag · orbit      scroll · zoom      ← → · steps      R · reset camera',
      'hint.drag': 'Drag to orbit · Wheel to zoom · Click a part to inspect',
      'legend.height': 'cube height = |value| · blue positive, orange negative',
      'legend.qkv': 'q / k / v projections for the selected head',
      'legend.plate': 'attention cell = query × key · bar height = weight',
      'legend.mask': 'dark red = hidden by the causal mask',
      'legend.mix': 'both heads concatenated, then added back (residual)',
      'legend.ffn': 'ReLU units of the selected token',
      'legend.logits': 'next-token distribution over the toy vocabulary',
      'vec.id': 'id #{id}',
      'vec.normQ': '||q||',
      'vec.normK': '||k||',
      'vec.attn': 'attention →',
      'vec.dims': 'hidden dims',
      'meter.top': 'top prediction',
      'stage.tokens': 'Tokens',
      'stage.embed': 'Embed',
      'stage.qkv': 'Q · K · V',
      'stage.attention': 'Attention',
      'stage.mix': 'Mix',
      'stage.ffn': 'FFN',
      'stage.logits': 'Logits',
      'f.tokens': 'ids = [0, 1, 2, 3, 0]',
      'f.embed': 'x = E[id] + P[pos]',
      'f.qkv': 'q = x·Wq   k = x·Wk   v = x·Wv',
      'f.attention': 'softmax(q·kᵀ / √d + mask)',
      'f.mix': 'heads ⧺ heads · Wo + x',
      'f.ffn': 'ReLU(x·W₁)·W₂ + x',
      'f.logits': 'softmax(u·h)',
      'n.tokens': 'The sentence enters as five discrete ids. Position is added later, not here.',
      'n.embed': 'Each id becomes a vector; a position vector is added so order matters.',
      'n.qkv': 'Three learned projections per head: what I look for, what I offer, what I pass on.',
      'n.attention': 'Every query is compared with every key it is allowed to see, then normalised.',
      'n.mix': 'Heads are joined back to model width, projected, and added to the residual stream.',
      'n.ffn': 'A position-wise MLP: expand, ReLU, project back, add to the residual stream.',
      'n.logits': 'The last position is projected onto the vocabulary and softmaxed.',
      'm1.t': 'Read token 3’s attention row',
      'm1.d': 'Open the Attention stage and select the third token.',
      'm2.t': 'Compare the two heads',
      'm2.d': 'Switch the attention head and watch the scores change.',
      'm3.t': 'Find the causal mask',
      'm3.d': 'Click a dark red cell: a token may not look ahead.',
      'm4.t': 'Read the FFN activations',
      'm4.d': 'Select the last token and open the FFN stage.',
      'm5.t': 'Play the whole pipeline',
      'm5.d': 'Run the seven stages through to the logits.',
      'ms.done': 'done',
      'ctl.layers': 'Layers',
      'ctl.heads': 'Heads',
      'ctl.dModel': 'Model width',
      'ctl.dFF': 'FFN width',
      'opt.heads': 'Draw attention heads',
      'opt.residual': 'Residual stream',
      'opt.labels': 'Labels',
      'opt.rotate': 'Auto rotate',
      'opt.spread': 'Layer spacing',
      'btn.iso': 'Isometric',
      'btn.front': 'Front',
      'btn.top': 'Top',
      'btn.side': 'Side',
      'stat.params': 'Parameters',
      'stat.flops': 'FLOPs / token',
      'stat.kv': 'KV cache / token',
      'stat.depth': 'Depth',
      'stat.width': 'Width',
      'insp.empty': 'Click a cube, a head or a plate to read its shape and cost.',
      'insp.shape': 'Shape',
      'insp.params': 'Parameters',
      'insp.stage': 'Stage',
      'insp.layer': 'Layer',
      'insp.share': 'Share of model',
      'insp.note': 'Note',
      'insp.focus': 'Focus',
      'insp.clear': 'Clear',
      'app.custom': 'Custom',
      'app.preset': 'Model preset',
      'node.tokens': 'Input tokens',
      'node.embed': 'Token embedding',
      'node.ln': 'LayerNorm',
      'node.normFinal': 'Final LayerNorm',
      'node.attn': 'Multi-head attention',
      'node.head': 'Attention head',
      'node.proj': 'Attention output projection',
      'node.ffn': 'Feed-forward network',
      'node.unembed': 'Output head → logits',
      'node.residual': 'Residual stream',
      'node.tokenWord': 'token “{w}”',
      'node.attnCell': 'attention {q} → {k}',
      'note.tokens': 'Discrete token ids enter the network here.',
      'note.embed': 'Lookup table that maps every vocabulary entry to a model-width vector.',
      'note.ln': 'Normalizes each vector across the model width before the sub-layer.',
      'note.head': 'Each head projects into head_dim and attends to a different subspace.',
      'note.proj': 'Concatenated heads are projected back to the model width and added to the residual stream.',
      'note.ffn': 'Position-wise MLP. This is where most parameters of a modern decoder live.',
      'note.out': 'Projects the final hidden state onto the vocabulary.',
      'note.mask': 'Blocked by the causal mask: a token may not attend to a future position.',
    };

    const DICT_ZH = {
      'app.title': 'Transformer 3D Lab',
      'app.sub': '一个五 token 的 Transformer 块，在空间里展开',
      'app.subExplore': '完整堆栈：层、注意力头、残差流',
      'mode.pipeline': '流水线',
      'mode.explore': '全栈结构',
      'missions.chip': '任务 {n}/5',
      'missions.title': '任务',
      'missions.done': '全部任务已完成',
      'chip.head': '头 {n} · {word}',
      'btn.play': '播放流水线',
      'btn.stop': '停止',
      'btn.reset': '重置视角',
      'btn.run': '运行前向传播',
      'btn.overview': '总览',
      'token.title': 'Token',
      'token.pick': '选一个 token',
      'heads.title': '注意力头',
      'panel.pipeline': '流水线',
      'panel.vector': '词向量状态',
      'panel.legend': '你看到的是什么',
      'panel.structure': '结构',
      'panel.display': '显示',
      'panel.view': '视角',
      'panel.inspect': '检视器',
      'step.badge': '{n}/7 · {name}',
      'hint.bar': '拖拽 · 旋转      滚轮 · 缩放      ← → · 逐步切换      R · 重置镜头',
      'hint.drag': '拖拽旋转 · 滚轮缩放 · 点击部件查看细节',
      'legend.height': '方块高度 = |数值| · 蓝色为正，橙色为负',
      'legend.qkv': '所选头的 q / k / v 投影',
      'legend.plate': '注意力格 = 查询 × 键 · 柱高 = 权重',
      'legend.mask': '暗红 = 被因果掩码挡住的位置',
      'legend.mix': '两个头拼接后加回残差流',
      'legend.ffn': '所选 token 的 ReLU 单元',
      'legend.logits': '小词表上的下一个 token 分布',
      'vec.id': '编号 #{id}',
      'vec.normQ': '||q||',
      'vec.normK': '||k||',
      'vec.attn': '注意力 →',
      'vec.dims': '隐层维度',
      'meter.top': '最高预测',
      'stage.tokens': 'Token',
      'stage.embed': '词嵌入',
      'stage.qkv': 'Q · K · V',
      'stage.attention': '注意力',
      'stage.mix': '混合',
      'stage.ffn': '前馈',
      'stage.logits': 'Logits',
      'f.tokens': 'ids = [0, 1, 2, 3, 0]',
      'f.embed': 'x = E[id] + P[pos]',
      'f.qkv': 'q = x·Wq   k = x·Wk   v = x·Wv',
      'f.attention': 'softmax(q·kᵀ / √d + mask)',
      'f.mix': 'heads ⧺ heads · Wo + x',
      'f.ffn': 'ReLU(x·W₁)·W₂ + x',
      'f.logits': 'softmax(u·h)',
      'n.tokens': '句子以五个离散 id 进入网络；位置信息在下一步才加入。',
      'n.embed': '每个 id 变成一个向量，再加上位置向量，顺序才有意义。',
      'n.qkv': '每个头有三组学习得到的投影：我要找什么、我提供什么、我传递什么。',
      'n.attention': '每个查询与它被允许看到的键逐一比较，再归一化。',
      'n.mix': '各头拼接回模型宽度、投影，然后加回残差流。',
      'n.ffn': '逐位置 MLP：升维、ReLU、降维，再加回残差流。',
      'n.logits': '最后一个位置被投影到词表上，再过 softmax。',
      'm1.t': '读出第 3 个 token 的注意力行',
      'm1.d': '打开 Attention 阶段并选中第三个 token。',
      'm2.t': '对比两个头',
      'm2.d': '切换注意力头，观察注意力分布的变化。',
      'm3.t': '找到因果掩码',
      'm3.d': '点一个暗红格子：token 看不到未来。',
      'm4.t': '读出 FFN 激活',
      'm4.d': '选中最后一个 token 并打开 FFN 阶段。',
      'm5.t': '完整播放流水线',
      'm5.d': '让七个阶段一路跑到 logits。',
      'ms.done': '已完成',
      'ctl.layers': '层数',
      'ctl.heads': '注意力头',
      'ctl.dModel': '模型宽度',
      'ctl.dFF': 'FFN 宽度',
      'opt.heads': '绘制注意力头',
      'opt.residual': '残差流',
      'opt.labels': '标签',
      'opt.rotate': '自动旋转',
      'opt.spread': '层间距',
      'btn.iso': '轴测',
      'btn.front': '正视',
      'btn.top': '俯视',
      'btn.side': '侧视',
      'stat.params': '参数量',
      'stat.flops': '每 token FLOPs',
      'stat.kv': '每 token KV 缓存',
      'stat.depth': '深度',
      'stat.width': '宽度',
      'insp.empty': '点击方块、注意力头或归一化片，查看其形状与开销。',
      'insp.shape': '形状',
      'insp.params': '参数量',
      'insp.stage': '阶段',
      'insp.layer': '层号',
      'insp.share': '占全模型',
      'insp.note': '说明',
      'insp.focus': '聚焦',
      'insp.clear': '取消选择',
      'app.custom': '自定义',
      'app.preset': '模型预设',
      'node.tokens': '输入 token',
      'node.embed': '词嵌入矩阵',
      'node.ln': 'LayerNorm',
      'node.normFinal': '最终 LayerNorm',
      'node.attn': '多头注意力',
      'node.head': '注意力头',
      'node.proj': '注意力输出投影',
      'node.ffn': '前馈网络',
      'node.unembed': '输出头 → logits',
      'node.residual': '残差流',
      'node.tokenWord': 'token “{w}”',
      'node.attnCell': '注意力 {q} → {k}',
      'note.tokens': '离散的 token id 从这里进入网络。',
      'note.embed': '把词表中的每个词映射为模型宽度向量的查找表。',
      'note.ln': '在子层之前沿模型宽度方向归一化每个向量。',
      'note.head': '每个头投影到 head_dim 维子空间，各自关注不同的模式。',
      'note.proj': '各头拼接后被投影回模型宽度，并加回残差流。',
      'note.ffn': '逐位置 MLP，现代解码器的大部分参数集中在这里。',
      'note.out': '把最终隐状态投影到词表上。',
      'note.mask': '被因果掩码挡住：token 不能看向未来的位置。',
    };

    let localeFace = null;
    let boundTranslate = null;

    function activeIsZh() {
      try {
        if (!localeFace) return false;
        const snap = localeFace.getLocale();
        const id = snap && snap.active ? String(snap.active).toLowerCase() : '';
        return id.indexOf('zh') === 0;
      } catch (e) {
        return false;
      }
    }

    function t(key, vars) {
      let text = null;
      if (boundTranslate) {
        try {
          const v = boundTranslate(key);
          if (typeof v === 'string' && v && v !== key) text = v;
        } catch (e) { /* fall back to the local dictionary */ }
      }
      if (!text) {
        const zh = activeIsZh();
        text = zh && DICT_ZH[key] != null ? DICT_ZH[key] : DICT_EN[key] != null ? DICT_EN[key] : key;
      }
      if (vars && text.indexOf('{') >= 0) {
        text = text.replace(/\{(\w+)\}/g, function (m, k) {
          return vars[k] == null ? m : String(vars[k]);
        });
      }
      return text;
    }

    function useLocaleTick() {
      const pair = React.useState(0);
      const bump = pair[1];
      React.useEffect(function () {
        if (!localeFace || typeof localeFace.subscribe !== 'function') return undefined;
        return localeFace.subscribe(function () { bump(function (v) { return v + 1; }); });
      }, []);
      return pair[0];
    }

    /* =====================================================================
     * 1. Math, formatting, geometry
     * ===================================================================*/

    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
    function lerp(a, b, k) { return a + (b - a) * k; }

    function rotView(p, yaw, pitch) {
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = p[0] * cy + p[2] * sy;
      const z1 = -p[0] * sy + p[2] * cy;
      const y2 = p[1] * cp - z1 * sp;
      const z2 = p[1] * sp + z1 * cp;
      return [x1, y2, z2];
    }

    const LIGHT = (function () {
      const v = [-0.38, 0.66, 0.65];
      const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
      return [v[0] / len, v[1] / len, v[2] / len];
    })();

    const BOX_V = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];

    const BOX_F = [
      { v: [4, 5, 6, 7], n: [0, 0, 1] },
      { v: [1, 0, 3, 2], n: [0, 0, -1] },
      { v: [0, 4, 7, 3], n: [-1, 0, 0] },
      { v: [5, 1, 2, 6], n: [1, 0, 0] },
      { v: [3, 7, 6, 2], n: [0, 1, 0] },
      { v: [0, 1, 5, 4], n: [0, -1, 0] },
    ];

    function byteOf(v) {
      const n = Math.round(v * 255);
      return n < 0 ? 0 : n > 255 ? 255 : n;
    }

    function rgbOf(color, alpha) {
      if (alpha == null || alpha >= 0.999) {
        return 'rgb(' + byteOf(color[0]) + ',' + byteOf(color[1]) + ',' + byteOf(color[2]) + ')';
      }
      return 'rgba(' + byteOf(color[0]) + ',' + byteOf(color[1]) + ',' + byteOf(color[2]) + ',' +
        (Math.round(clamp(alpha, 0, 1) * 1000) / 1000) + ')';
    }

    function mixColor(a, b, k) {
      const f = clamp(k, 0, 1);
      return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
    }

    function formatCount(n) {
      if (!isFinite(n) || n <= 0) return '0';
      if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
      if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
      return String(Math.round(n));
    }

    function formatBytes(b) {
      if (!isFinite(b) || b <= 0) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let v = b;
      let i = 0;
      while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
      return (i === 0 ? String(Math.round(v)) : v.toFixed(1)) + ' ' + units[i];
    }

    /* =====================================================================
     * 2. The toy transformer: a real forward pass with seeded weights
     * ===================================================================*/

    const TOY = {
      words: ['the', 'cat', 'sat', 'on', 'the'],
      ids: [0, 1, 2, 3, 0],
      vocab: ['the', 'cat', 'sat', 'on', 'a', 'mat', 'dog', 'ran'],
      dModel: 8,
      heads: 2,
      dHead: 4,
      dHidden: 16,
      seed: 20240917,
    };

    const SHOW_DIM = 6;

    function mulberry32(seed) {
      let a = seed >>> 0;
      return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let x = a;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      };
    }

    function gauss(rand) {
      let u = 0;
      let v = 0;
      while (u === 0) u = rand();
      while (v === 0) v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function matrix(rows, cols, rand, scale) {
      const m = [];
      for (let r = 0; r < rows; r += 1) {
        const row = [];
        for (let c = 0; c < cols; c += 1) row.push(gauss(rand) * scale);
        m.push(row);
      }
      return m;
    }

    function matVec(m, vec) {
      const out = [];
      for (let r = 0; r < m.length; r += 1) {
        let s = 0;
        for (let c = 0; c < vec.length; c += 1) s += m[r][c] * vec[c];
        out.push(s);
      }
      return out;
    }

    function dot(a, b) {
      let s = 0;
      for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
      return s;
    }

    function normOf(a) { return Math.sqrt(dot(a, a)); }

    function softmax(values) {
      let max = -Infinity;
      for (let i = 0; i < values.length; i += 1) if (values[i] > max) max = values[i];
      let sum = 0;
      const out = [];
      for (let i = 0; i < values.length; i += 1) {
        const e = Math.exp(values[i] - max);
        out.push(e);
        sum += e;
      }
      for (let i = 0; i < out.length; i += 1) out[i] = sum > 0 ? out[i] / sum : 0;
      return out;
    }

    let toyCache = null;

    function toyModel() {
      if (toyCache) return toyCache;
      const rand = mulberry32(TOY.seed);
      const d = TOY.dModel;
      const H = TOY.heads;
      const dh = TOY.dHead;
      const V = TOY.vocab.length;
      const T = TOY.ids.length;

      const E = matrix(V, d, rand, 0.95);
      const P = matrix(T, d, rand, 0.34);
      /* every projection is (output rows) × (input cols) for matVec */
      const Wq = [], Wk = [], Wv = [];
      for (let hIdx = 0; hIdx < H; hIdx += 1) {
        Wq.push(matrix(dh, d, rand, 0.35));
        Wk.push(matrix(dh, d, rand, 0.35));
        Wv.push(matrix(dh, d, rand, 0.40));
      }
      const Wo = matrix(d, H * dh, rand, 0.5);
      const W1 = matrix(TOY.dHidden, d, rand, 0.45);
      const W2 = matrix(d, TOY.dHidden, rand, 0.5);
      const U = matrix(d, V, rand, 0.22);

      const x = TOY.ids.map(function (id, i) {
        return E[id].map(function (v, c) { return v + P[i][c]; });
      });

      const heads = [];
      for (let hIdx = 0; hIdx < H; hIdx += 1) {
        const q = x.map(function (v) { return matVec(Wq[hIdx], v); });
        const k = x.map(function (v) { return matVec(Wk[hIdx], v); });
        const vv = x.map(function (v) { return matVec(Wv[hIdx], v); });
        const A = [];
        for (let i = 0; i < T; i += 1) {
          const scores = [];
          for (let j = 0; j < T; j += 1) scores.push(j <= i ? dot(q[i], k[j]) / Math.sqrt(dh) : -Infinity);
          A.push(softmax(scores));
        }
        const out = [];
        for (let i = 0; i < T; i += 1) {
          const acc = [];
          for (let c = 0; c < dh; c += 1) acc.push(0);
          for (let j = 0; j < T; j += 1) {
            for (let c = 0; c < dh; c += 1) acc[c] += A[i][j] * vv[j][c];
          }
          out.push(acc);
        }
        heads.push({
          q: q, k: k, v: vv, A: A, out: out,
          qNorm: q.map(normOf),
          kNorm: k.map(normOf),
        });
      }

      const concat = [];
      for (let i = 0; i < T; i += 1) {
        const row = [];
        for (let hIdx = 0; hIdx < H; hIdx += 1) {
          for (let c = 0; c < dh; c += 1) row.push(heads[hIdx].out[i][c]);
        }
        concat.push(row);
      }

      const attnOut = x.map(function (v, i) {
        const p = matVec(Wo, concat[i]);
        return p.map(function (nv, c) { return nv + v[c]; });
      });

      const hidden = attnOut.map(function (v) {
        return matVec(W1, v).map(function (nv) { return nv > 0 ? nv : 0; });
      });

      const ffnOut = hidden.map(function (hv, i) {
        const p = matVec(W2, hv);
        return p.map(function (nv, c) { return nv + attnOut[i][c]; });
      });

      const last = ffnOut[T - 1];
      const logits = [];
      for (let vIdx = 0; vIdx < V; vIdx += 1) {
        let s = 0;
        for (let c = 0; c < d; c += 1) s += last[c] * U[c][vIdx];
        logits.push(s);
      }
      const probs = softmax(logits);
      let top = 0;
      for (let i = 1; i < probs.length; i += 1) if (probs[i] > probs[top]) top = i;

      toyCache = {
        x: x, heads: heads, concat: concat, attnOut: attnOut,
        hidden: hidden, ffnOut: ffnOut, logits: logits, probs: probs, top: top,
      };
      return toyCache;
    }

    /* =====================================================================
     * 3. Pipeline scene — one block, seven stages, laid out in depth
     * ===================================================================*/

    const PIPE = ['tokens', 'embed', 'qkv', 'attention', 'mix', 'ffn', 'logits'];

    function stageZ(k) { return 18 - k * 6; }
    function tokenX(i) { return (i - 2) * 2.6; }

    const COLOR = {
      pos: [0.32, 0.56, 1.0],
      neg: [1.0, 0.56, 0.26],
      q: [0.36, 0.62, 1.0],
      k: [0.24, 0.86, 0.78],
      v: [0.72, 0.46, 1.0],
      attn: [0.78, 0.32, 0.95],
      attnHot: [1.0, 0.44, 0.86],
      mask: [0.40, 0.10, 0.20],
      head: [1.0, 0.44, 0.72],
      residual: [0.30, 0.64, 1.0],
      ffn: [0.24, 0.82, 0.72],
      logit: [1.0, 0.72, 0.32],
      plate: [0.46, 0.56, 0.95],
      rug: [0.18, 0.26, 0.58],
      tokens: [
        [0.22, 0.86, 0.62],
        [0.22, 0.62, 1.0],
        [1.0, 0.70, 0.24],
        [0.70, 0.48, 1.0],
        [0.22, 0.86, 0.62],
      ],
    };

    function buildPipelineScene(model, opts, tr) {
      const trn = typeof tr === 'function' ? tr : t;
      const nodes = [];
      const labels = [];
      const lines = [];
      const tokenIndex = clamp(opts.tokenIndex || 0, 0, 4);
      const headIndex = clamp(opts.headIndex || 0, 0, TOY.heads - 1);
      const head = model.heads[headIndex];

      for (let k = 0; k < PIPE.length; k += 1) {
        nodes.push({
          id: 'plate' + k,
          kind: 'plate',
          stageIndex: k,
          x: 0, y: 0, z: stageZ(k) - 0.5,
          sx: 15.4, sy: 9.6, sz: 0.06,
          color: COLOR.plate,
          alpha: 0.085,
          pickable: false,
        });
      }

      nodes.push({
        id: 'rug', kind: 'rug', stageIndex: 0,
        x: 0, y: -4.1, z: stageZ(0) + 0.6,
        sx: 15.0, sy: 0.10, sz: 5.6,
        color: COLOR.rug, alpha: 0.9, pickable: false,
      });
      for (let i = 0; i < TOY.words.length; i += 1) {
        nodes.push({
          id: 'tok' + i,
          kind: 'token',
          stageIndex: 0,
          x: tokenX(i), y: -2.0, z: stageZ(0) + 0.6,
          sx: 2.0, sy: 2.0, sz: 2.0,
          color: COLOR.tokens[i],
          meta: {
            title: trn('node.tokenWord', { w: TOY.words[i] }),
            stage: trn('stage.tokens'),
            shape: 'id #' + TOY.ids[i],
            note: trn('n.tokens'),
            tokenIndex: i,
          },
        });
        labels.push({
          text: TOY.words[i],
          x: tokenX(i), y: -4.05, z: stageZ(0) + 3.4,
          size: 19, strong: true,
        });
      }

      for (let i = 0; i < TOY.words.length; i += 1) {
        const vec = model.x[i];
        for (let c = 0; c < SHOW_DIM; c += 1) {
          const v = vec[c];
          const size = clamp(Math.abs(v) * 0.42, 0.16, 1.0);
          nodes.push({
            id: 'emb' + i + '_' + c,
            kind: 'value',
            stageIndex: 1,
            x: tokenX(i),
            y: -3.7 + c * 1.12 + size * 0.5,
            z: stageZ(1),
            sx: 0.62, sy: size, sz: 0.62,
            color: v >= 0 ? COLOR.pos : COLOR.neg,
            meta: {
              title: trn('stage.embed') + ' · ' + TOY.words[i] + '[' + c + ']',
              stage: trn('stage.embed'),
              shape: 'x[' + c + '] = ' + v.toFixed(2),
              note: trn('n.embed'),
            },
          });
        }
      }

      const groups = [
        { key: 'q', data: head.q, color: COLOR.q, z: stageZ(2) + 2.0 },
        { key: 'k', data: head.k, color: COLOR.k, z: stageZ(2) },
        { key: 'v', data: head.v, color: COLOR.v, z: stageZ(2) - 2.0 },
      ];
      for (let g = 0; g < groups.length; g += 1) {
        const group = groups[g];
        for (let i = 0; i < TOY.words.length; i += 1) {
          for (let c = 0; c < TOY.dHead; c += 1) {
            const v = group.data[i][c];
            const size = clamp(Math.abs(v) * 0.38, 0.16, 1.0);
            nodes.push({
              id: group.key + i + '_' + c,
              kind: 'value',
              stageIndex: 2,
              x: tokenX(i),
              y: -2.6 + c * 1.35 + size * 0.5,
              z: group.z,
              sx: 0.6, sy: size, sz: 0.6,
              color: group.color,
              meta: {
                title: group.key + ' · ' + TOY.words[i] + '[' + c + ']',
                stage: trn('stage.qkv'),
                shape: group.key + '[' + c + '] = ' + v.toFixed(2),
                note: trn('n.qkv'),
              },
            });
          }
        }
        labels.push({
          text: group.key.toUpperCase(),
          x: -8.1, y: -2.2, z: group.z,
          size: 14, strong: true,
        });
      }

      for (let i = 0; i < TOY.words.length; i += 1) {
        for (let j = 0; j < TOY.words.length; j += 1) {
          const w = head.A[i][j];
          const masked = j > i;
          const hot = clamp(w * 4.2, 0, 1);
          nodes.push({
            id: 'att' + i + '_' + j,
            kind: 'attnCell',
            stageIndex: 3,
            x: (j - 2) * 2.15,
            y: (2 - i) * 2.0,
            z: stageZ(3),
            sx: 1.85, sy: masked ? 0.18 : clamp(w * 6.0, 0.2, 2.6), sz: 1.85,
            color: masked ? COLOR.mask : mixColor(COLOR.attn, COLOR.attnHot, hot),
            alpha: masked ? 0.92 : 1,
            meta: {
              title: trn('node.attnCell', { q: TOY.words[i], k: TOY.words[j] }),
              stage: trn('stage.attention'),
              shape: masked ? '—' : w.toFixed(3),
              note: masked ? trn('note.mask') : trn('n.attention'),
              masked: masked,
              cell: [i, j],
            },
          });
          if (!masked && i === tokenIndex) {
            labels.push({
              text: w.toFixed(2),
              x: (j - 2) * 2.15, y: (2 - i) * 2.0 + 1.5, z: stageZ(3),
              size: 13, strong: false,
            });
          }
        }
      }

      for (let i = 0; i < TOY.words.length; i += 1) {
        for (let c = 0; c < 4; c += 1) {
          const cv = model.concat[i][c];
          const cs = clamp(Math.abs(cv) * 0.4, 0.16, 1.0);
          nodes.push({
            id: 'mix' + i + '_' + c,
            kind: 'value',
            stageIndex: 4,
            x: tokenX(i),
            y: -3.0 + c * 1.45 + cs * 0.5,
            z: stageZ(4) + 1.1,
            sx: 0.58, sy: cs, sz: 0.58,
            color: COLOR.head,
            meta: {
              title: trn('stage.mix') + ' · ' + TOY.words[i],
              stage: trn('stage.mix'),
              shape: 'heads[' + c + '] = ' + cv.toFixed(2),
              note: trn('n.mix'),
            },
          });
          const rv = model.attnOut[i][c];
          const rs = clamp(Math.abs(rv) * 0.34, 0.16, 1.0);
          nodes.push({
            id: 'res' + i + '_' + c,
            kind: 'value',
            stageIndex: 4,
            x: tokenX(i),
            y: -3.0 + c * 1.45 + rs * 0.5,
            z: stageZ(4) - 1.1,
            sx: 0.58, sy: rs, sz: 0.58,
            color: COLOR.residual,
            meta: {
              title: trn('stage.mix') + ' + residual · ' + TOY.words[i],
              stage: trn('stage.mix'),
              shape: 'attnOut[' + c + '] = ' + rv.toFixed(2),
              note: trn('n.mix'),
            },
          });
        }
      }

      const hiddenVec = model.hidden[tokenIndex];
      for (let c = 0; c < 12; c += 1) {
        const v = hiddenVec[c];
        const size = clamp(v * 0.5, 0.1, 2.6);
        nodes.push({
          id: 'ffn' + c,
          kind: 'ffnUnit',
          stageIndex: 5,
          x: -5.6 + c * 1.02,
          y: -3.9 + size * 0.5,
          z: stageZ(5),
          sx: 0.72, sy: size, sz: 0.72,
          color: COLOR.ffn,
          meta: {
            title: trn('stage.ffn') + ' · h[' + c + ']',
            stage: trn('stage.ffn'),
            shape: 'relu(h[' + c + ']) = ' + v.toFixed(2),
            note: trn('n.ffn'),
          },
        });
      }
      labels.push({
        text: TOY.words[tokenIndex] + ' · ' + trn('stage.ffn'),
        x: 0, y: 2.4, z: stageZ(5),
        size: 14, strong: true,
      });

      const V = TOY.vocab.length;
      let maxProb = 0;
      for (let vIdx = 0; vIdx < V; vIdx += 1) maxProb = Math.max(maxProb, model.probs[vIdx]);
      for (let vIdx = 0; vIdx < V; vIdx += 1) {
        const p = model.probs[vIdx];
        const size = 0.18 + 4.0 * (maxProb > 0 ? p / maxProb : 0);
        const isTop = vIdx === model.top;
        nodes.push({
          id: 'log' + vIdx,
          kind: 'logit',
          stageIndex: 6,
          x: -6.3 + vIdx * 1.85,
          y: -3.9 + size * 0.5,
          z: stageZ(6),
          sx: 1.0, sy: size, sz: 1.0,
          color: isTop ? COLOR.logit : mixColor(COLOR.logit, COLOR.plate, 0.62),
          meta: {
            title: TOY.vocab[vIdx],
            stage: trn('stage.logits'),
            shape: 'p = ' + (p * 100).toFixed(1) + '%',
            note: trn('n.logits'),
          },
        });
        labels.push({
          text: TOY.vocab[vIdx],
          x: -6.3 + vIdx * 1.85, y: -4.4, z: stageZ(6) + 0.9,
          size: 13, strong: isTop,
        });
        if (isTop) {
          labels.push({
            text: (p * 100).toFixed(0) + '%',
            x: -6.3 + vIdx * 1.85, y: -3.6 + size, z: stageZ(6),
            size: 14, strong: true,
          });
        }
      }

      lines.push({
        kind: 'axis',
        label: '',
        from: [-8.4, 5.4, stageZ(0)],
        to: [-8.4, 5.4, stageZ(PIPE.length - 1)],
        color: [0.62, 0.72, 0.95],
        width: 1.4,
      });
      lines.push({
        kind: 'residual',
        label: trn('node.residual'),
        from: [8.4, -3.4, stageZ(0)],
        to: [8.4, -3.4, stageZ(PIPE.length - 1)],
        color: COLOR.residual,
        width: 2.4,
      });

      for (let k = 0; k < PIPE.length; k += 1) {
        labels.push({
          text: (k + 1) + ' · ' + trn('stage.' + PIPE[k]),
          x: -7.2, y: 4.9, z: stageZ(k),
          size: 15, strong: true,
        });
      }

      let maxX = 0, maxY = 0, maxZ = 0;
      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        maxX = Math.max(maxX, Math.abs(n.x) + n.sx * 0.5);
        maxY = Math.max(maxY, Math.abs(n.y) + n.sy * 0.5);
        maxZ = Math.max(maxZ, Math.abs(n.z) + n.sz * 0.5);
      }
      const radius = Math.max(4, Math.sqrt(maxX * maxX + maxY * maxY + maxZ * maxZ));

      return {
        mode: 'pipeline',
        nodes: nodes,
        labels: labels,
        lines: lines,
        radius: radius,
        stages: PIPE.length,
        zMin: stageZ(PIPE.length - 1),
        zMax: stageZ(0),
        tokenIndex: tokenIndex,
        headIndex: headIndex,
      };
    }

    /* =====================================================================
     * 4. Explore scene — the whole stack, layer by layer
     * ===================================================================*/

    const PRESETS = [
      { id: 'gpt2', label: 'GPT-2 Small', arch: 'decoder', layers: 12, heads: 12, kvHeads: 12, dModel: 768, dFF: 3072, vocab: 50257, gated: false, tied: true },
      { id: 'gpt2xl', label: 'GPT-2 XL', arch: 'decoder', layers: 48, heads: 25, kvHeads: 25, dModel: 1600, dFF: 6400, vocab: 50257, gated: false, tied: true },
      { id: 'llama3', label: 'Llama-3 8B', arch: 'decoder', layers: 32, heads: 32, kvHeads: 8, dModel: 4096, dFF: 14336, vocab: 128256, gated: true, tied: false },
      { id: 'bert', label: 'BERT-base', arch: 'encoder', layers: 12, heads: 12, kvHeads: 12, dModel: 768, dFF: 3072, vocab: 30522, gated: false, tied: true },
      { id: 'vit', label: 'ViT-B/16', arch: 'encoder', layers: 12, heads: 12, kvHeads: 12, dModel: 768, dFF: 3072, vocab: 0, patch: 768, gated: false, tied: true },
    ];

    const STACK_COLOR = {
      token: [0.62, 0.45, 0.98],
      embed: [0.33, 0.55, 0.98],
      norm: [0.56, 0.62, 0.74],
      proj: [0.93, 0.53, 0.34],
      ffn: [0.26, 0.78, 0.62],
      out: [0.98, 0.76, 0.32],
      attnMerged: [0.96, 0.42, 0.62],
      residual: [0.50, 0.86, 1.0],
      axis: [0.62, 0.70, 0.86],
    };

    function presetById(id) {
      for (let i = 0; i < PRESETS.length; i += 1) if (PRESETS[i].id === id) return PRESETS[i];
      return PRESETS[0];
    }

    function cfgFromPreset(id) {
      const p = presetById(id);
      return {
        id: p.id, label: p.label, arch: p.arch,
        layers: p.layers, heads: p.heads, kvHeads: p.kvHeads,
        dModel: p.dModel, dFF: p.dFF, vocab: p.vocab,
        patch: p.patch || 0, gated: !!p.gated, tied: !!p.tied,
      };
    }

    function computeStats(cfg) {
      const d = Math.max(8, Math.round(cfg.dModel));
      const heads = Math.max(1, Math.round(cfg.heads));
      const kvHeads = Math.max(1, Math.min(Math.round(cfg.kvHeads || heads), heads));
      const headDim = Math.max(1, Math.round(d / heads));
      const kvDim = Math.max(1, headDim * kvHeads);
      const dFF = Math.max(8, Math.round(cfg.dFF));
      const vocab = Math.max(0, Math.round(cfg.vocab || 0));
      const embedIn = cfg.patch ? Math.round(cfg.patch) : vocab;

      const embed = embedIn * d;
      const attnParams = 2 * d * d + 2 * d * kvDim;
      const ffnParams = (cfg.gated ? 3 : 2) * d * dFF;
      const normParams = 2 * d;
      const perLayer = attnParams + ffnParams + normParams * 2;
      const head = cfg.tied ? 0 : vocab * d;
      const total = embed + Math.round(cfg.layers) * perLayer + normParams + head;

      return {
        d: d, heads: heads, kvHeads: kvHeads, headDim: headDim, kvDim: kvDim,
        dFF: dFF, vocab: vocab, embedIn: embedIn,
        embed: embed, attnParams: attnParams, ffnParams: ffnParams,
        normParams: normParams, perLayer: perLayer, head: head, total: total,
        headParams: 3 * d * headDim,
        flopsToken: 2 * total,
        kvBytesPerToken: 2 * Math.round(cfg.layers) * kvDim * 2,
      };
    }

    function headTint(k, count) {
      const f = count <= 1 ? 0 : k / (count - 1);
      return [lerp(0.98, 0.66, f), lerp(0.41, 0.32, f), lerp(0.63, 0.95, f)];
    }

    function buildStackScene(cfg, opts, tr) {
      const trn = typeof tr === 'function' ? tr : t;
      const stats = computeStats(cfg);
      const layers = Math.max(1, Math.round(cfg.layers));
      const nodes = [];
      const lines = [];

      const unitY = 4.2;
      const width = 8.4;
      const spread = clamp(opts.spread || 1, 0.5, 2.6);
      const blockLen = clamp(30 / layers, 0.55, 2.6) * spread;
      const slabZ = clamp(blockLen * 0.17, 0.10, 0.55);
      const drawHeads = opts.showHeads === false ? 0 : Math.max(1, Math.min(cfg.heads, layers > 24 ? 8 : 16));
      const headSlot = width / Math.max(1, drawHeads);
      const ffnRatio = Math.max(1, cfg.dFF / Math.max(1, cfg.dModel));
      const ffnY = clamp(unitY * (1 + 0.42 * Math.log(ffnRatio) / Math.LN2), unitY, unitY * 2.0);

      let z = 0;
      const tokenCount = 4;
      const tokenZ = z - Math.max(1.6, blockLen * 0.7);
      for (let i = 0; i < tokenCount; i += 1) {
        nodes.push({
          id: 'tok' + i, kind: 'token', label: i === 0 ? trn('node.tokens') : '',
          x: (i - (tokenCount - 1) / 2) * 1.7, y: 0, z: tokenZ,
          sx: 1.1, sy: 1.1, sz: 1.1, color: STACK_COLOR.token,
          meta: { stage: trn('node.tokens'), shape: 'B × T', params: 0, note: trn('note.tokens'), layer: null },
        });
      }

      nodes.push({
        id: 'embed', kind: 'embed', label: trn('node.embed'),
        x: 0, y: 0, z: z,
        sx: width, sy: unitY, sz: clamp(blockLen * 0.5, 0.6, 1.6),
        color: STACK_COLOR.embed,
        meta: {
          stage: trn('node.embed'),
          shape: (cfg.patch ? 'patch=' + cfg.patch : 'V=' + stats.vocab) + ' × d=' + stats.d,
          params: stats.embed, note: trn('note.embed'), layer: null,
        },
      });

      const blockZStart = z;

      for (let i = 0; i < layers; i += 1) {
        z += blockLen * 0.16;
        nodes.push({
          id: 'l' + i + '.ln1', kind: 'norm', label: '',
          x: 0, y: 0, z: z,
          sx: width * 1.05, sy: unitY * 1.04, sz: slabZ * 0.4, color: STACK_COLOR.norm,
          meta: { stage: trn('node.ln'), shape: 'd=' + stats.d, params: stats.normParams, note: trn('note.ln'), layer: i },
        });

        z += blockLen * 0.22;
        if (drawHeads > 0) {
          for (let k = 0; k < drawHeads; k += 1) {
            nodes.push({
              id: 'l' + i + '.h' + k, kind: 'head',
              label: i === 0 && k === 0 ? trn('node.head') : '',
              x: -width / 2 + headSlot * (k + 0.5), y: 0, z: z,
              sx: headSlot * 0.74, sy: unitY * 0.9, sz: slabZ,
              color: headTint(k, drawHeads),
              meta: { stage: trn('node.attn'), shape: 'head_dim=' + stats.headDim, params: stats.headParams, note: trn('note.head'), layer: i },
            });
          }
        } else {
          nodes.push({
            id: 'l' + i + '.attn', kind: 'head', label: i === 0 ? trn('node.attn') : '',
            x: 0, y: 0, z: z, sx: width, sy: unitY, sz: slabZ * 1.6,
            color: STACK_COLOR.attnMerged,
            meta: { stage: trn('node.attn'), shape: stats.heads + ' heads × ' + stats.headDim, params: stats.attnParams, note: trn('note.head'), layer: i },
          });
        }

        z += blockLen * 0.2;
        nodes.push({
          id: 'l' + i + '.proj', kind: 'attnOut', label: i === 0 ? trn('node.proj') : '',
          x: 0, y: 0, z: z, sx: width, sy: unitY, sz: slabZ * 0.7, color: STACK_COLOR.proj,
          meta: { stage: trn('node.proj'), shape: 'd=' + stats.d + ' → d=' + stats.d, params: stats.attnParams, note: trn('note.proj'), layer: i },
        });

        z += blockLen * 0.16;
        nodes.push({
          id: 'l' + i + '.ln2', kind: 'norm', label: '',
          x: 0, y: 0, z: z, sx: width * 1.05, sy: unitY * 1.04, sz: slabZ * 0.4, color: STACK_COLOR.norm,
          meta: { stage: trn('node.ln'), shape: 'd=' + stats.d, params: stats.normParams, note: trn('note.ln'), layer: i },
        });

        z += blockLen * 0.18;
        nodes.push({
          id: 'l' + i + '.ffn', kind: 'ffn', label: i === 0 ? trn('node.ffn') : '',
          x: 0, y: 0, z: z, sx: width * 0.88, sy: ffnY, sz: slabZ * 1.2, color: STACK_COLOR.ffn,
          meta: { stage: trn('node.ffn'), shape: stats.d + ' → ' + stats.dFF + ' → ' + stats.d, params: stats.ffnParams, note: trn('note.ffn'), layer: i },
        });
        z += blockLen * 0.08;
      }

      z += blockLen * 0.18;
      nodes.push({
        id: 'normFinal', kind: 'norm', label: trn('node.normFinal'),
        x: 0, y: 0, z: z, sx: width * 1.05, sy: unitY * 1.04, sz: slabZ * 0.4, color: STACK_COLOR.norm,
        meta: { stage: trn('node.ln'), shape: 'd=' + stats.d, params: stats.normParams, note: trn('note.ln'), layer: null },
      });

      z += blockLen * 0.3;
      nodes.push({
        id: 'out', kind: 'out', label: trn('node.unembed'),
        x: 0, y: 0, z: z, sx: width, sy: unitY, sz: clamp(blockLen * 0.45, 0.6, 1.4),
        color: STACK_COLOR.out,
        meta: {
          stage: trn('node.unembed'),
          shape: 'd=' + stats.d + ' → V=' + (stats.vocab || '—'),
          params: cfg.tied ? 0 : stats.head, note: trn('note.out'), layer: null,
        },
      });

      const zMin = tokenZ;
      const zMax = z;
      const zMid = (zMin + zMax) / 2;
      for (let i = 0; i < nodes.length; i += 1) nodes[i].z -= zMid;

      const residualX = -(width / 2 + 1.7);
      lines.push({
        kind: 'residual', label: trn('node.residual'),
        from: [residualX, 0, blockZStart - zMid], to: [residualX, 0, zMax - zMid],
        color: STACK_COLOR.residual, width: 3,
      });
      lines.push({
        kind: 'axis', label: '',
        from: [0, -(unitY * 0.5 + 1.5), zMin - zMid], to: [0, -(unitY * 0.5 + 1.5), zMax - zMid],
        color: STACK_COLOR.axis, width: 1.4,
      });

      let maxX = 0, maxY = 0, maxZ = 0;
      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        maxX = Math.max(maxX, Math.abs(n.x) + n.sx * 0.5);
        maxY = Math.max(maxY, Math.abs(n.y) + n.sy * 0.5);
        maxZ = Math.max(maxZ, Math.abs(n.z) + n.sz * 0.5);
      }
      const radius = Math.max(3, Math.sqrt(maxX * maxX + maxY * maxY + maxZ * maxZ));

      return {
        mode: 'explore',
        nodes: nodes, labels: [], lines: lines,
        stats: stats, radius: radius,
        zMin: zMin - zMid, zMax: zMax - zMid, blockLen: blockLen,
      };
    }

    /* which node is active for a forward-pass progress in [0, 1] */
    function nodeAtProgress(scene, p) {
      if (!scene || !(p > 0)) return null;
      const zAt = lerp(scene.zMin, scene.zMax, clamp(p, 0, 1));
      const windowSize = Math.max(0.8, (scene.blockLen || 2) * 0.45);
      let best = null;
      let bestDz = Infinity;
      for (let i = 0; i < scene.nodes.length; i += 1) {
        const node = scene.nodes[i];
        if (node.kind === 'token' || node.stageIndex != null) continue;
        const dz = Math.abs(node.z - zAt);
        if (dz < bestDz) { bestDz = dz; best = node; }
      }
      if (!best || bestDz > windowSize) return { id: null, strength: 0, node: null, p: p };
      return { id: best.id, strength: clamp(1 - bestDz / windowSize, 0, 1), node: best, p: p };
    }

    /* =====================================================================
     * 5. Renderer: hand-rolled perspective projection + painter's algorithm
     * ===================================================================*/

    const VIEW_PRESETS = {
      iso: { yaw: -0.66, pitch: 0.40 },
      front: { yaw: 0.0, pitch: 0.12 },
      top: { yaw: -0.66, pitch: 1.14 },
      side: { yaw: -1.46, pitch: 0.18 },
    };

    function fitDistance(scene) {
      if (!scene) return 50;
      return scene.radius * (scene.mode === 'pipeline' ? 2.15 : 2.6);
    }

    function createLab3D(canvas, callbacks) {
      const cb = callbacks || {};
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) return null;

      const view = {
        yaw: VIEW_PRESETS.iso.yaw, pitch: VIEW_PRESETS.iso.pitch, dist: 50,
        yawT: VIEW_PRESETS.iso.yaw, pitchT: VIEW_PRESETS.iso.pitch, distT: 50,
        focus: [0, 0, 0], focusT: [0, 0, 0],
        w: 900, h: 620, dpr: 1, focal: 900,
      };

      const options = {
        selectedId: null,
        showResidual: true,
        showLabels: true,
        autoRotate: false,
        playing: false,
        focusStage: null,
      };

      let scene = null;
      let hasScene = false;
      let projections = [];
      const facesBuf = [];
      let hoverId = null;
      let drag = null;
      let progress = 0;
      let raf = 0;
      let dirty = true;
      let alive = true;
      let lastFrame = 0;
      let lastProgressSent = -1;

      function projectPoint(x, y, z) {
        const v = rotView([x - view.focus[0], y - view.focus[1], z - view.focus[2]], view.yaw, view.pitch);
        const depth = view.dist - v[2];
        if (depth < 0.35) return null;
        const s = view.focal / depth;
        return { x: view.w * 0.5 + v[0] * s, y: view.h * 0.5 - v[1] * s, depth: depth, s: s };
      }

      function pickAt(px, py) {
        let best = null;
        for (let i = 0; i < projections.length; i += 1) {
          const p = projections[i];
          if (p.node.pickable === false) continue;
          const dx = px - p.x;
          const dy = py - p.y;
          const r = Math.max(9, p.r * 0.9);
          if (dx * dx + dy * dy <= r * r) {
            if (!best || p.depth < best.depth) best = p;
          }
        }
        return best;
      }

      function drawLines(near, span, alphaScale) {
        if (!scene || alphaScale <= 0) return;
        ctx2d.save();
        ctx2d.lineCap = 'round';
        for (let i = 0; i < scene.lines.length; i += 1) {
          const line = scene.lines[i];
          if (line.kind === 'residual' && !options.showResidual) continue;
          const a = projectPoint(line.from[0], line.from[1], line.from[2]);
          const b = projectPoint(line.to[0], line.to[1], line.to[2]);
          if (!a || !b) continue;
          const fog = 1 - 0.7 * clamp((a.depth - near) / span, 0, 1);
          ctx2d.globalAlpha = clamp(alphaScale * fog, 0, 1);
          ctx2d.strokeStyle = rgbOf(line.color);
          ctx2d.lineWidth = line.width;
          if (line.kind === 'axis') ctx2d.setLineDash([5, 8]);
          else ctx2d.setLineDash([]);
          ctx2d.beginPath();
          ctx2d.moveTo(a.x, a.y);
          ctx2d.lineTo(b.x, b.y);
          ctx2d.stroke();
        }
        ctx2d.setLineDash([]);
        ctx2d.restore();
      }

      function drawText(text, x, y, size, strong, alpha) {
        ctx2d.font = (strong ? '600 ' : '') + size + 'px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
        ctx2d.lineWidth = Math.max(2, size * 0.24);
        ctx2d.strokeStyle = 'rgba(3, 7, 18, 0.85)';
        ctx2d.lineJoin = 'round';
        ctx2d.strokeText(text, x, y);
        ctx2d.fillStyle = 'rgba(228, 237, 255, ' + clamp(alpha, 0.12, 1).toFixed(2) + ')';
        ctx2d.fillText(text, x, y);
      }

      function drawLabels(near, span) {
        if (!scene) return;
        ctx2d.save();
        ctx2d.textAlign = 'left';
        ctx2d.textBaseline = 'middle';
        ctx2d.globalAlpha = 1;

        for (let i = 0; i < projections.length; i += 1) {
          const p = projections[i];
          const node = p.node;
          if (!node.label) continue;
          const alpha = clamp(1 - 0.72 * clamp((p.depth - near) / span, 0, 1), 0.16, 1);
          const tx = p.x + p.hw + 8;
          const ty = p.y + p.hh * 0.1;
          if (tx > view.w - 4 || ty < 4 || ty > view.h - 4) continue;
          drawText(node.label, tx, ty, 11, false, alpha);
        }

        const labels = scene.labels || [];
        for (let i = 0; i < labels.length; i += 1) {
          const item = labels[i];
          const p = projectPoint(item.x, item.y, item.z);
          if (!p) continue;
          const alpha = clamp(1 - 0.7 * clamp((p.depth - near) / span, 0, 1), 0.18, 1);
          if (p.x < -60 || p.x > view.w + 60 || p.y < -20 || p.y > view.h + 20) continue;
          drawText(item.text, p.x, p.y, item.size || 12, !!item.strong, alpha);
        }

        ctx2d.textAlign = 'center';
        for (let i = 0; i < scene.lines.length; i += 1) {
          const line = scene.lines[i];
          if (!line.label) continue;
          if (line.kind === 'residual' && !options.showResidual) continue;
          const mid = projectPoint(
            (line.from[0] + line.to[0]) / 2,
            (line.from[1] + line.to[1]) / 2,
            (line.from[2] + line.to[2]) / 2,
          );
          if (!mid) continue;
          const alpha = clamp(1 - 0.7 * clamp((mid.depth - near) / span, 0, 1), 0.2, 1);
          drawText(line.label, mid.x - 24, mid.y - 12, 11, false, alpha);
        }
        ctx2d.restore();
      }

      function draw() {
        ctx2d.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
        ctx2d.clearRect(0, 0, view.w, view.h);
        if (!scene) return;

        const near = view.dist - scene.radius * 1.15;
        const span = Math.max(1, scene.radius * 2.3);
        const active = scene.mode === 'explore' ? nodeAtProgress(scene, progress) : null;

        projections = [];
        facesBuf.length = 0;

        for (let i = 0; i < scene.nodes.length; i += 1) {
          const node = scene.nodes[i];
          const center = projectPoint(node.x, node.y, node.z);
          if (!center) continue;
          const halfW = node.sx * 0.5 * center.s;
          const halfH = node.sy * 0.5 * center.s;
          projections.push({
            id: node.id, node: node, x: center.x, y: center.y, depth: center.depth,
            hw: halfW, hh: halfH, r: Math.max(halfW, halfH),
          });

          const isSel = options.selectedId === node.id;
          const isHover = hoverId === node.id;
          const actStrength = active && active.id === node.id ? active.strength : 0;
          let boost = (isSel ? 0.22 : 0) + (isHover ? 0.12 : 0) + actStrength * 0.5;

          let nodeAlpha = node.alpha == null ? 1 : node.alpha;
          if (options.focusStage != null && node.stageIndex != null && node.stageIndex !== options.focusStage) {
            nodeAlpha *= node.kind === 'plate' ? 0.55 : 0.3;
            boost *= 0.35;
          }
          if (isSel) nodeAlpha = Math.max(nodeAlpha, 0.95);

          const isGlass = node.kind === 'plate' || nodeAlpha < 0.7;

          for (let f = 0; f < 6; f += 1) {
            const face = BOX_F[f];
            const nv = rotView(face.n, view.yaw, view.pitch);
            if (nv[2] <= 0.0005) continue;
            const quad = [];
            let dsum = 0;
            let ok = true;
            for (let vi = 0; vi < 4; vi += 1) {
              const corner = BOX_V[face.v[vi]];
              const p = projectPoint(
                node.x + corner[0] * node.sx * 0.5,
                node.y + corner[1] * node.sy * 0.5,
                node.z + corner[2] * node.sz * 0.5,
              );
              if (!p) { ok = false; break; }
              quad.push(p.x, p.y);
              dsum += p.depth;
            }
            if (!ok) continue;
            const depth = dsum / 4;
            const diffuse = Math.max(0, nv[0] * LIGHT[0] + nv[1] * LIGHT[1] + nv[2] * LIGHT[2]);
            const fog = 1 - 0.74 * clamp((depth - near) / span, 0, 1);
            const shade = (0.34 + 0.82 * diffuse) * fog + boost;
            const c = node.color;
            facesBuf.push({
              d: depth,
              q: quad,
              fill: rgbOf([c[0] * shade, c[1] * shade, c[2] * shade], nodeAlpha),
              sel: isSel,
              hov: isHover,
              glass: isGlass,
              node: node,
            });
          }
        }

        facesBuf.sort(function (a, b) { return b.d - a.d; });

        drawLines(near, span, 0.32);

        for (let i = 0; i < facesBuf.length; i += 1) {
          const face = facesBuf[i];
          const q = face.q;
          ctx2d.beginPath();
          ctx2d.moveTo(q[0], q[1]);
          ctx2d.lineTo(q[2], q[3]);
          ctx2d.lineTo(q[4], q[5]);
          ctx2d.lineTo(q[6], q[7]);
          ctx2d.closePath();
          ctx2d.fillStyle = face.fill;
          ctx2d.fill();
          if (face.sel) {
            ctx2d.strokeStyle = 'rgba(255,255,255,0.94)';
            ctx2d.lineWidth = 1.7;
            ctx2d.stroke();
          } else if (face.hov) {
            ctx2d.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx2d.lineWidth = 1;
            ctx2d.stroke();
          } else if (face.glass) {
            const focused = options.focusStage != null && face.node.stageIndex === options.focusStage;
            ctx2d.strokeStyle = focused ? 'rgba(150,180,255,0.55)' : 'rgba(140,165,225,0.22)';
            ctx2d.lineWidth = 1;
            ctx2d.stroke();
          }
        }

        drawLines(near, span, 0.14);

        if (options.showLabels) drawLabels(near, span);
      }

      function frame(now) {
        if (!alive) return;
        raf = window.requestAnimationFrame(frame);
        const dt = lastFrame ? Math.min(64, Math.max(1, now - lastFrame)) : 16;
        lastFrame = now;
        const ease = clamp(dt / 105, 0, 1);

        if (options.autoRotate && !drag) {
          view.yaw += dt * 0.00022;
          view.yawT = view.yaw;
          dirty = true;
        } else {
          if (Math.abs(view.yawT - view.yaw) > 1e-4) { view.yaw += (view.yawT - view.yaw) * ease; dirty = true; }
          if (Math.abs(view.pitchT - view.pitch) > 1e-4) { view.pitch += (view.pitchT - view.pitch) * ease; dirty = true; }
          if (Math.abs(view.distT - view.dist) > 1e-3) { view.dist += (view.distT - view.dist) * ease; dirty = true; }
        }

        let focusMoved = false;
        for (let i = 0; i < 3; i += 1) {
          if (Math.abs(view.focusT[i] - view.focus[i]) > 1e-3) {
            view.focus[i] += (view.focusT[i] - view.focus[i]) * ease;
            focusMoved = true;
          }
        }
        if (focusMoved) dirty = true;

        if (options.playing) {
          progress += dt * 0.00032;
          if (progress >= 1) {
            progress = 1;
            options.playing = false;
            lastProgressSent = 1;
            if (cb.onProgress) cb.onProgress(1);
          } else if (Math.abs(progress - lastProgressSent) > 0.004) {
            lastProgressSent = progress;
            if (cb.onProgress) cb.onProgress(progress);
          }
          dirty = true;
        }

        if (!dirty) return;
        dirty = false;
        draw();
      }

      function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));
        view.w = w;
        view.h = h;
        view.dpr = dpr;
        view.focal = Math.min(w, h) * 1.5;
        canvas.width = Math.max(1, Math.round(w * dpr));
        canvas.height = Math.max(1, Math.round(h * dpr));
        dirty = true;
      }

      function localPoint(ev) {
        const rect = canvas.getBoundingClientRect();
        return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      }

      function onPointerDown(ev) {
        if (ev.button !== undefined && ev.button !== 0) return;
        const p = localPoint(ev);
        drag = { id: ev.pointerId, x: p.x, y: p.y, moved: 0 };
        try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* capture is optional */ }
        canvas.style.cursor = 'grabbing';
      }

      function onPointerMove(ev) {
        const p = localPoint(ev);
        if (drag && drag.id === ev.pointerId) {
          const dx = p.x - drag.x;
          const dy = p.y - drag.y;
          drag.x = p.x;
          drag.y = p.y;
          drag.moved += Math.abs(dx) + Math.abs(dy);
          view.yawT += dx * 0.0072;
          view.pitchT = clamp(view.pitchT + dy * 0.006, -1.35, 1.35);
          dirty = true;
          return;
        }
        const hit = pickAt(p.x, p.y);
        const nextId = hit ? hit.id : null;
        if (nextId !== hoverId) {
          hoverId = nextId;
          dirty = true;
          canvas.style.cursor = hit ? 'pointer' : 'grab';
          if (cb.onHover) cb.onHover(hit ? { id: hit.id, node: hit.node, x: hit.x, y: hit.y } : null);
        }
      }

      function onPointerUp(ev) {
        if (!drag || drag.id !== ev.pointerId) return;
        const wasClick = drag.moved < 5;
        const p = localPoint(ev);
        drag = null;
        try { canvas.releasePointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
        canvas.style.cursor = 'grab';
        if (wasClick) {
          const hit = pickAt(p.x, p.y);
          if (cb.onSelect) cb.onSelect(hit ? hit.id : null, hit ? hit.node : null);
        }
        dirty = true;
      }

      function onPointerLeave() {
        if (hoverId !== null) {
          hoverId = null;
          dirty = true;
          if (cb.onHover) cb.onHover(null);
        }
      }

      function onWheel(ev) {
        ev.preventDefault();
        const unit = scene ? scene.radius : 20;
        const factor = Math.exp(clamp(ev.deltaY, -140, 140) * 0.0016);
        view.distT = clamp(view.distT * factor, unit * 0.5, unit * 14);
        dirty = true;
      }

      function onDoubleClick(ev) {
        const p = localPoint(ev);
        const hit = pickAt(p.x, p.y);
        if (hit && cb.onSelect) cb.onSelect(hit.id, hit.node);
        if (hit && hit.node && hit.node.stageIndex != null) {
          view.focusT = [0, 0.4, hit.node.z];
          view.distT = scene ? scene.radius * 1.05 : view.distT;
        } else if (scene) {
          view.distT = scene.radius * 1.3;
        }
        dirty = true;
      }

      const observer = typeof window.ResizeObserver === 'function'
        ? new window.ResizeObserver(function () { resize(); })
        : null;

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('pointerleave', onPointerLeave);
      canvas.addEventListener('wheel', onWheel, { passive: false });
      canvas.addEventListener('dblclick', onDoubleClick);
      if (observer) observer.observe(canvas);

      resize();

      return {
        start: function () {
          if (raf) return;
          alive = true;
          raf = window.requestAnimationFrame(frame);
        },
        dispose: function () {
          alive = false;
          if (raf) window.cancelAnimationFrame(raf);
          raf = 0;
          if (observer) observer.disconnect();
          canvas.removeEventListener('pointerdown', onPointerDown);
          canvas.removeEventListener('pointermove', onPointerMove);
          canvas.removeEventListener('pointerup', onPointerUp);
          canvas.removeEventListener('pointercancel', onPointerUp);
          canvas.removeEventListener('pointerleave', onPointerLeave);
          canvas.removeEventListener('wheel', onWheel);
          canvas.removeEventListener('dblclick', onDoubleClick);
        },
        resize: resize,
        setScene: function (next) {
          const modeChanged = !scene || !next || scene.mode !== next.mode;
          scene = next;
          if (next) {
            if (!hasScene || modeChanged) {
              hasScene = true;
              view.dist = view.distT = fitDistance(next);
              view.focus = [0, 0, 0];
              view.focusT = [0, 0, 0];
              view.yaw = view.yawT = VIEW_PRESETS.iso.yaw;
              view.pitch = view.pitchT = VIEW_PRESETS.iso.pitch;
            } else {
              view.dist = clamp(view.dist, next.radius * 0.5, next.radius * 14);
              view.distT = view.dist;
            }
          }
          hoverId = null;
          dirty = true;
        },
        setSelected: function (id) {
          options.selectedId = id || null;
          dirty = true;
        },
        setDisplay: function (next) {
          options.showResidual = next.showResidual !== false;
          options.showLabels = next.showLabels !== false;
          options.autoRotate = !!next.autoRotate;
          if (next.focusStage !== undefined) options.focusStage = next.focusStage == null ? null : next.focusStage;
          dirty = true;
        },
        setFocusStage: function (stage) {
          options.focusStage = stage == null ? null : stage;
          if (scene && scene.mode === 'pipeline') {
            if (stage == null) {
              view.focusT = [0, 0, 0];
              view.distT = fitDistance(scene);
            } else {
              view.focusT = [0, 0.4, stageZ(stage)];
              view.distT = scene.radius * 1.02;
            }
          }
          dirty = true;
        },
        setPlaying: function (on) {
          options.playing = !!on;
          if (on) {
            progress = 0;
            lastProgressSent = -1;
          }
          dirty = true;
        },
        setProgress: function (p) {
          progress = p > 0 ? clamp(p, 0, 1) : 0;
          if (progress === 0) lastProgressSent = -1;
          dirty = true;
        },
        setView: function (name) {
          const preset = VIEW_PRESETS[name] || VIEW_PRESETS.iso;
          view.yawT = preset.yaw;
          view.pitchT = preset.pitch;
          dirty = true;
        },
        overview: function () {
          view.yawT = VIEW_PRESETS.iso.yaw;
          view.pitchT = VIEW_PRESETS.iso.pitch;
          view.focusT = [0, 0, 0];
          if (scene) view.distT = fitDistance(scene);
          dirty = true;
        },
        focus: function () {
          if (!scene) return;
          view.distT = scene.radius * 1.1;
          dirty = true;
        },
      };
    }

    /* =====================================================================
     * 6. Styles — the viewport is artwork (always dark); every panel uses
     *    host theme tokens so it joins the surrounding application.
     * ===================================================================*/

    const CSS = [
      '.t3l-root{position:relative;width:100%;height:100%;min-height:460px;overflow:hidden;',
      'background:radial-gradient(120% 85% at 50% 8%,#141d3c 0%,#0a1024 52%,#05070f 100%);',
      'color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.4}',
      '.t3l-canvas{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none;',
      'cursor:grab;outline:none}',
      '.t3l-top{position:absolute;top:0;left:0;right:0;z-index:4;display:flex;align-items:center;gap:10px;',
      'flex-wrap:wrap;padding:8px 12px;background:var(--dsw-alias-bg-layer-1);',
      'border-bottom:1px solid var(--dsw-alias-border-l1)}',
      '.t3l-brandmark{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;',
      'justify-content:center;color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2);',
      'border:1px solid var(--dsw-alias-border-l1)}',
      '.t3l-brand{display:flex;flex-direction:column;gap:0;margin-right:2px;min-width:0}',
      '.t3l-title{font-size:13px;font-weight:600;letter-spacing:.01em;white-space:nowrap}',
      '.t3l-sub{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;',
      'text-overflow:ellipsis;max-width:340px}',
      '.t3l-seg{display:flex;padding:2px;gap:2px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);',
      'border:1px solid var(--dsw-alias-border-l1)}',
      '.t3l-seg>button{padding:3px 10px;border:0;border-radius:6px;background:transparent;font:inherit;',
      'font-size:11px;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.t3l-seg>button[data-active="true"]{background:var(--dsw-alias-brand-primary);color:#fff}',
      '.t3l-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;',
      'font-size:11px;letter-spacing:.04em;text-transform:uppercase;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap}',
      '.t3l-pill[data-done="true"]{color:var(--dsw-alias-state-success-primary);',
      'border-color:var(--dsw-alias-state-success-primary)}',
      '.t3l-badge{position:absolute;left:234px;top:58px;z-index:3;pointer-events:none}',
      '.t3l-left,.t3l-right{position:absolute;top:56px;bottom:42px;z-index:3;display:flex;',
      'flex-direction:column;gap:8px;overflow-y:auto;padding:8px 10px;pointer-events:none}',
      '.t3l-left{left:0;width:224px}',
      '.t3l-right{right:0;width:296px}',
      '.t3l-left>*,.t3l-right>*{pointer-events:auto}',
      '.t3l-card{display:flex;flex-direction:column;gap:7px;padding:9px 10px;border-radius:10px;',
      'background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);',
      'box-shadow:0 8px 22px rgba(3,6,16,.32)}',
      '.t3l-cardhead{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.t3l-cardtitle{font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;',
      'color:var(--dsw-alias-label-secondary)}',
      '.t3l-bottom{position:absolute;left:0;right:0;bottom:0;z-index:4;display:flex;align-items:center;',
      'gap:12px;flex-wrap:wrap;padding:6px 12px;font-size:11px;color:var(--dsw-alias-label-secondary);',
      'background:var(--dsw-alias-bg-layer-1);border-top:1px solid var(--dsw-alias-border-l1)}',
      '.t3l-bottom b{color:var(--dsw-alias-label-primary);font-weight:600}',
      '.t3l-btn{padding:4px 9px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;',
      'font-size:11px;cursor:pointer;white-space:nowrap}',
      '.t3l-btn:hover{border-color:var(--dsw-alias-border-l2)}',
      '.t3l-btn[data-active="true"]{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}',
      '.t3l-btn-row{display:flex;flex-wrap:wrap;gap:6px}',
      '.t3l-select{padding:4px 7px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;',
      'font-size:11px;cursor:pointer;max-width:150px}',
      '.t3l-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;',
      'color:var(--dsw-alias-label-secondary)}',
      '.t3l-val{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
      '.t3l-slider{display:flex;flex-direction:column;gap:1px}',
      '.t3l-range{width:100%;height:14px;cursor:pointer;accent-color:var(--dsw-alias-brand-primary)}',
      '.t3l-check{display:flex;align-items:center;gap:7px;font-size:11px;cursor:pointer;',
      'color:var(--dsw-alias-label-secondary)}',
      '.t3l-check input{accent-color:var(--dsw-alias-brand-primary);cursor:pointer}',
      '.t3l-pipe{display:flex;flex-direction:column;gap:1px}',
      '.t3l-pipe-row{display:flex;align-items:flex-start;gap:8px;padding:5px 6px;border-radius:7px;',
      'border:1px solid transparent;background:transparent;font:inherit;text-align:left;cursor:pointer;',
      'color:var(--dsw-alias-label-secondary)}',
      '.t3l-pipe-row:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.t3l-pipe-row[data-active="true"]{background:var(--dsw-alias-bg-layer-2);',
      'border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}',
      '.t3l-pipe-num{flex:0 0 18px;height:18px;border-radius:50%;display:flex;align-items:center;',
      'justify-content:center;font-size:10px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary)}',
      '.t3l-pipe-row[data-active="true"] .t3l-pipe-num{background:var(--dsw-alias-brand-primary);',
      'border-color:transparent;color:#fff}',
      '.t3l-pipe-body{display:flex;flex-direction:column;gap:0;min-width:0}',
      '.t3l-pipe-name{font-size:11px;font-weight:600;color:inherit}',
      '.t3l-pipe-f{font-size:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;',
      'color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.t3l-kv{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px}',
      '.t3l-kv-k{color:var(--dsw-alias-label-secondary)}',
      '.t3l-kv-v{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
      '.t3l-meter{position:relative;height:6px;border-radius:3px;overflow:hidden;',
      'background:var(--dsw-alias-bg-layer-2)}',
      '.t3l-meter>i{display:block;height:100%;background:var(--dsw-alias-brand-primary)}',
      '.t3l-wrow{display:flex;align-items:center;gap:6px;font-size:11px;',
      'color:var(--dsw-alias-label-secondary)}',
      '.t3l-wrow>span:first-child{flex:0 0 34px}',
      '.t3l-wrow>.bar{flex:1 1 auto;height:5px;border-radius:3px;overflow:hidden;',
      'background:var(--dsw-alias-bg-layer-2)}',
      '.t3l-wrow>.bar>i{display:block;height:100%;background:var(--dsw-alias-brand-primary)}',
      '.t3l-wrow>.num{flex:0 0 34px;text-align:right;color:var(--dsw-alias-label-primary);',
      'font-variant-numeric:tabular-nums}',
      '.t3l-legend{display:flex;flex-direction:column;gap:5px}',
      '.t3l-legrow{display:flex;align-items:flex-start;gap:7px;font-size:11px;line-height:1.45;',
      'color:var(--dsw-alias-label-secondary)}',
      '.t3l-swatch{flex:0 0 9px;height:9px;border-radius:2px;margin-top:4px}',
      '.t3l-mission{display:flex;align-items:flex-start;gap:7px;padding:4px 5px;border-radius:6px;',
      'font-size:11px;color:var(--dsw-alias-label-secondary)}',
      '.t3l-mission[data-done="true"]{color:var(--dsw-alias-state-success-primary)}',
      '.t3l-mission .dot{flex:0 0 13px;height:13px;border-radius:50%;margin-top:1px;',
      'border:1px solid var(--dsw-alias-border-l2);display:flex;align-items:center;',
      'justify-content:center;font-size:9px}',
      '.t3l-mission[data-done="true"] .dot{background:var(--dsw-alias-state-success-primary);',
      'border-color:transparent;color:#04240f}',
      '.t3l-mtext{display:flex;flex-direction:column;gap:1px;min-width:0}',
      '.t3l-mt{color:inherit;font-weight:600}',
      '.t3l-md{color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.4}',
      '.t3l-note{font-size:10px;line-height:1.55;color:var(--dsw-alias-label-secondary)}',
      '.t3l-tip{position:absolute;z-index:5;transform:translate(-50%,-155%);padding:3px 8px;',
      'border-radius:6px;font-size:11px;white-space:nowrap;pointer-events:none;',
      'color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-overlay);',
      'border:1px solid var(--dsw-alias-border-l2)}',
      '.t3l-empty{font-size:11px;line-height:1.55;color:var(--dsw-alias-label-secondary)}',
      '.t3l-chips{display:flex;flex-wrap:wrap;gap:6px}',
      '.t3l-chip{display:flex;flex-direction:column;gap:0;padding:2px 8px;border-radius:6px;',
      'border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}',
      '.t3l-chip-k{font-size:9px;color:var(--dsw-alias-label-secondary)}',
      '.t3l-chip-v{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}',
      '@media (max-width:1040px){.t3l-left{width:200px}.t3l-badge{left:210px}}',
      '@media (max-width:900px){.t3l-left{display:none}.t3l-badge{left:12px}}',
      '@media (max-width:780px){.t3l-right{display:none}}',
    ].join('');

    /* =====================================================================
     * 7. Components
     * ===================================================================*/

    function chip(key, value) {
      return h('div', { className: 't3l-chip', key: key },
        h('div', { className: 't3l-chip-k' }, key),
        h('div', { className: 't3l-chip-v' }, value));
    }

    function kvRow(key, value) {
      return h('div', { className: 't3l-kv', key: key },
        h('span', { className: 't3l-kv-k' }, key),
        h('span', { className: 't3l-kv-v' }, value));
    }

    function legRow(color, text, key) {
      return h('div', { className: 't3l-legrow', key: key || text },
        h('span', { className: 't3l-swatch', style: { background: rgbOf(color) } }),
        h('span', null, text));
    }

    function headIndex(id) {
      const idx = String(id).indexOf('.h');
      if (idx < 0) return null;
      const n = parseInt(String(id).slice(idx + 2), 10);
      return isFinite(n) ? n : null;
    }

    function nodeTitle(node) {
      if (!node) return '';
      if (node.meta && node.meta.title) return node.meta.title;
      const layer = node.meta && node.meta.layer != null ? ' · L' + (node.meta.layer + 1) : '';
      const kind = node.kind;
      if (kind === 'token') return t('node.tokens');
      if (kind === 'embed') return t('node.embed');
      if (kind === 'norm') return node.id === 'normFinal' ? t('node.normFinal') : t('node.ln') + layer;
      if (kind === 'head') {
        const n = headIndex(node.id);
        return n == null ? t('node.attn') + layer : t('node.head') + ' #' + (n + 1) + layer;
      }
      if (kind === 'attnOut') return t('node.proj') + layer;
      if (kind === 'ffn') return t('node.ffn') + layer;
      if (kind === 'out') return t('node.unembed');
      return layer || kind;
    }

    function PanelIcon(props) {
      const size = (props && props.size) || 18;
      const active = !!(props && props.active);
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, focusable: 'false', 'aria-hidden': 'true',
        style: { display: 'block', opacity: active ? 1 : 0.82 },
      },
        h('path', { d: 'M12 2.4 21 6.7 12 11 3 6.7Z', fill: 'currentColor' }),
        h('path', { d: 'M12 8.9 21 13.2 12 17.5 3 13.2Z', fill: 'currentColor', fillOpacity: 0.7 }),
        h('path', { d: 'M12 15.4 21 19.7 12 23.4 3 19.7Z', fill: 'currentColor', fillOpacity: 0.45 })
      );
    }

    function BrandMark() {
      return h('span', { className: 't3l-brandmark' }, h(PanelIcon, { size: 16, active: true }));
    }

    function LabPage() {
      const tick = useLocaleTick();
      const model = toyModel();

      const modeS = React.useState('pipeline');
      const mode = modeS[0];
      const setMode = modeS[1];

      const stepS = React.useState(0);
      const step = stepS[0];
      const setStep = stepS[1];

      const pipePlayS = React.useState(false);
      const pipePlaying = pipePlayS[0];
      const setPipePlaying = pipePlayS[1];

      const tokS = React.useState(4);
      const tokenIndex = tokS[0];
      const setTokenIndex = tokS[1];

      const headS = React.useState(0);
      const headIndex2 = headS[0];
      const setHeadIndex = headS[1];

      const doneS = React.useState([]);
      const done = doneS[0];
      const setDone = doneS[1];

      const hoverS = React.useState(null);
      const hover = hoverS[0];
      const setHover = hoverS[1];

      const selS = React.useState(null);
      const selectedId = selS[0];
      const setSelectedId = selS[1];

      const presetS = React.useState('gpt2');
      const presetId = presetS[0];
      const setPresetId = presetS[1];

      const cfgS = React.useState(function () { return cfgFromPreset('gpt2'); });
      const cfg = cfgS[0];
      const setCfg = cfgS[1];

      const optS = React.useState({
        showHeads: true, showResidual: true, showLabels: true, autoRotate: false, spread: 1,
      });
      const opts = optS[0];
      const setOpts = optS[1];

      const progS = React.useState(0);
      const progress = progS[0];
      const setProgress = progS[1];

      const playS = React.useState(false);
      const playing = playS[0];
      const setPlaying = playS[1];

      const canvasRef = React.useRef(null);
      const apiRef = React.useRef(null);

      function markDone(id) {
        setDone(function (prev) { return prev.indexOf(id) >= 0 ? prev : prev.concat([id]); });
      }

      const scene = React.useMemo(function () {
        if (mode === 'pipeline') {
          return buildPipelineScene(model, { tokenIndex: tokenIndex, headIndex: headIndex2 }, t);
        }
        return buildStackScene(cfg, opts, t);
      }, [mode, tokenIndex, headIndex2, cfg, opts, tick]);

      /* renderer lifetime */
      React.useEffect(function () {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const api = createLab3D(canvas, {
          onHover: function (info) { setHover(info); },
          onSelect: function (id, node) {
            setSelectedId(id);
            if (!node) return;
            if (node.meta && node.meta.tokenIndex != null) setTokenIndex(node.meta.tokenIndex);
            if (node.meta && node.meta.masked) markDone('m3');
            if (node.stageIndex != null) setStep(node.stageIndex);
          },
          onProgress: function (p) {
            setProgress(p);
            if (p >= 1) setPlaying(false);
          },
        });
        if (!api) return undefined;
        apiRef.current = api;
        api.start();
        return function () {
          api.dispose();
          apiRef.current = null;
        };
      }, []);

      React.useEffect(function () {
        if (apiRef.current) apiRef.current.setScene(scene);
      }, [scene]);

      React.useEffect(function () {
        if (apiRef.current) apiRef.current.setSelected(selectedId);
      }, [selectedId]);

      React.useEffect(function () {
        if (apiRef.current) {
          apiRef.current.setDisplay({
            showResidual: opts.showResidual,
            showLabels: opts.showLabels,
            autoRotate: opts.autoRotate,
          });
        }
      }, [opts.showResidual, opts.showLabels, opts.autoRotate]);

      React.useEffect(function () {
        if (apiRef.current) apiRef.current.setFocusStage(mode === 'pipeline' ? step : null);
      }, [mode, step, scene]);

      React.useEffect(function () {
        if (apiRef.current) apiRef.current.setPlaying(mode === 'explore' ? playing : false);
      }, [playing, mode]);

      /* pipeline playback */
      React.useEffect(function () {
        if (!pipePlaying) return undefined;
        const timer = window.setTimeout(function () {
          if (step >= PIPE.length - 1) {
            setPipePlaying(false);
            markDone('m5');
            return;
          }
          setStep(step + 1);
        }, 1500);
        return function () { window.clearTimeout(timer); };
      }, [pipePlaying, step]);

      /* missions that follow from the current view */
      React.useEffect(function () {
        if (mode !== 'pipeline') return;
        if (step === 3 && tokenIndex === 2) markDone('m1');
        if (headIndex2 === 1) markDone('m2');
        if (step === 5 && tokenIndex === TOY.words.length - 1) markDone('m4');
      }, [mode, step, tokenIndex, headIndex2]);

      /* keyboard: arrows step, R resets the camera */
      React.useEffect(function () {
        function onKey(ev) {
          const el = ev.target;
          const tag = el && el.tagName ? String(el.tagName).toLowerCase() : '';
          if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
          if (ev.key === 'ArrowRight') {
            ev.preventDefault();
            setPipePlaying(false);
            setStep(function (s) { return Math.min(PIPE.length - 1, s + 1); });
          } else if (ev.key === 'ArrowLeft') {
            ev.preventDefault();
            setPipePlaying(false);
            setStep(function (s) { return Math.max(0, s - 1); });
          } else if (ev.key === 'r' || ev.key === 'R') {
            if (apiRef.current) apiRef.current.overview();
          }
        }
        window.addEventListener('keydown', onKey);
        return function () { window.removeEventListener('keydown', onKey); };
      }, []);

      function updateCfg(patch) {
        setPresetId('custom');
        setCfg(function (prev) { return Object.assign({}, prev, patch); });
      }

      function updateOpts(patch) {
        setOpts(function (prev) { return Object.assign({}, prev, patch); });
      }

      function onPresetChange(ev) {
        const id = ev.target.value;
        setPresetId(id);
        if (id !== 'custom') setCfg(cfgFromPreset(id));
      }

      function togglePlay() {
        if (pipePlaying) { setPipePlaying(false); return; }
        setStep(0);
        setPipePlaying(true);
      }

      function toggleRun() {
        if (playing) { setPlaying(false); return; }
        setProgress(0);
        setPlaying(true);
      }

      function resetView() {
        if (apiRef.current) apiRef.current.overview();
      }

      function slider(key, value, min, max, stepSize, onChange) {
        return h('label', { className: 't3l-slider', key: key },
          h('div', { className: 't3l-row' },
            h('span', null, t(key)),
            h('span', { className: 't3l-val' }, String(value))),
          h('input', {
            className: 't3l-range', type: 'range', min: min, max: max, step: stepSize, value: value,
            'aria-label': t(key),
            onChange: function (ev) { onChange(Number(ev.target.value)); },
          }));
      }

      function check(key, value, onChange) {
        return h('label', { className: 't3l-check', key: key },
          h('input', {
            type: 'checkbox', checked: !!value,
            onChange: function (ev) { onChange(ev.target.checked); },
          }),
          h('span', null, t(key)));
      }

      /* ---------- derived view data ---------- */
      const nodeById = {};
      for (let i = 0; i < scene.nodes.length; i += 1) nodeById[scene.nodes[i].id] = scene.nodes[i];
      const selectedNode = selectedId ? nodeById[selectedId] || null : null;
      const meta = selectedNode ? selectedNode.meta : null;
      const share = meta && scene.stats && scene.stats.total > 0 ? meta.params / scene.stats.total : 0;
      const activeNode = mode === 'explore' ? nodeAtProgress(scene, progress) : null;

      const head = model.heads[headIndex2];
      const selectedWord = TOY.words[tokenIndex];
      const attnRow = head.A[tokenIndex];

      const doneCount = done.length;
      const missions = ['m1', 'm2', 'm3', 'm4', 'm5'];

      /* ---------- header ---------- */
      const header = h('div', { className: 't3l-top' },
        h(BrandMark, null),
        h('div', { className: 't3l-brand' },
          h('div', { className: 't3l-title' }, t('app.title')),
          h('div', { className: 't3l-sub' }, mode === 'pipeline' ? t('app.sub') : t('app.subExplore'))),
        h('div', { className: 't3l-seg' },
          h('button', {
            type: 'button', 'data-active': mode === 'pipeline' ? 'true' : 'false',
            onClick: function () { setMode('pipeline'); },
          }, t('mode.pipeline')),
          h('button', {
            type: 'button', 'data-active': mode === 'explore' ? 'true' : 'false',
            onClick: function () { setMode('explore'); },
          }, t('mode.explore'))),
        mode === 'pipeline'
          ? h('span', { className: 't3l-pill', 'data-done': doneCount >= 5 ? 'true' : 'false' },
            t('missions.chip', { n: doneCount }))
          : null,
        mode === 'pipeline'
          ? h('span', { className: 't3l-pill' }, t('chip.head', { n: headIndex2 + 1, word: selectedWord }))
          : h('select', {
            className: 't3l-select', value: presetId, 'aria-label': t('app.preset'),
            onChange: onPresetChange,
          },
            PRESETS.map(function (p) { return h('option', { key: p.id, value: p.id }, p.label); }),
            h('option', { key: 'custom', value: 'custom' }, t('app.custom'))),
        h('div', { style: { flex: '1 1 auto' } }),
        mode === 'pipeline'
          ? h('button', {
            className: 't3l-btn', type: 'button',
            'data-active': pipePlaying ? 'true' : 'false',
            onClick: togglePlay,
          }, pipePlaying ? t('btn.stop') : t('btn.play'))
          : h('button', {
            className: 't3l-btn', type: 'button',
            'data-active': playing ? 'true' : 'false',
            onClick: toggleRun,
          }, playing ? t('btn.stop') : t('btn.run')),
        h('button', { className: 't3l-btn', type: 'button', onClick: resetView }, t('btn.reset'))
      );

      /* ---------- left column ---------- */
      const left = h('div', { className: 't3l-left' },
        mode === 'pipeline'
          ? h('div', { className: 't3l-card' },
            h('div', { className: 't3l-cardhead' }, h('span', { className: 't3l-cardtitle' }, t('token.title'))),
            h('div', { className: 't3l-btn-row' },
              TOY.words.map(function (word, i) {
                return h('button', {
                  key: 'tok' + i, type: 'button', className: 't3l-btn',
                  'data-active': tokenIndex === i ? 'true' : 'false',
                  onClick: function () { setTokenIndex(i); },
                }, word);
              })))
          : null,
        mode === 'pipeline'
          ? h('div', { className: 't3l-card' },
            h('div', { className: 't3l-cardhead' },
              h('span', { className: 't3l-cardtitle' }, t('heads.title')),
              h('span', { className: 't3l-kv-v' }, '#' + (headIndex2 + 1))),
            h('div', { className: 't3l-btn-row' },
              [0, 1].map(function (i) {
                return h('button', {
                  key: 'head' + i, type: 'button', className: 't3l-btn',
                  'data-active': headIndex2 === i ? 'true' : 'false',
                  onClick: function () { setHeadIndex(i); },
                }, 'Head ' + (i + 1));
              })))
          : null,
        mode === 'pipeline'
          ? h('div', { className: 't3l-card' },
            h('div', { className: 't3l-cardhead' },
              h('span', { className: 't3l-cardtitle' }, t('missions.title')),
              h('span', { className: 't3l-kv-v' }, doneCount + '/5')),
            h('div', null,
              missions.map(function (id) {
                const isDone = done.indexOf(id) >= 0;
                return h('div', {
                  key: id, className: 't3l-mission', 'data-done': isDone ? 'true' : 'false',
                },
                  h('span', { className: 'dot' }, isDone ? '✓' : ''),
                  h('span', { className: 't3l-mtext' },
                    h('span', { className: 't3l-mt' }, t(id + '.t')),
                    h('span', { className: 't3l-md' }, t(id + '.d'))));
              })),
            doneCount >= 5 ? h('div', { className: 't3l-note' }, t('missions.done')) : null)
          : null,
        mode === 'explore'
          ? h('div', { className: 't3l-card' },
            h('div', { className: 't3l-cardhead' }, h('span', { className: 't3l-cardtitle' }, t('panel.structure'))),
            slider('ctl.layers', cfg.layers, 1, 48, 1, function (v) { updateCfg({ layers: v }); }),
            slider('ctl.heads', cfg.heads, 1, 48, 1, function (v) {
              updateCfg({ heads: v, kvHeads: Math.max(1, Math.min(cfg.kvHeads, v)) });
            }),
            slider('ctl.dModel', cfg.dModel, 128, 8192, 64, function (v) { updateCfg({ dModel: v }); }),
            slider('ctl.dFF', cfg.dFF, 128, 32768, 128, function (v) { updateCfg({ dFF: v }); })
          )
          : null,
        h('div', { className: 't3l-card' },
          h('div', { className: 't3l-cardhead' }, h('span', { className: 't3l-cardtitle' }, t('panel.display'))),
          check('opt.labels', opts.showLabels, function (v) { updateOpts({ showLabels: v }); }),
          check('opt.rotate', opts.autoRotate, function (v) { updateOpts({ autoRotate: v }); }),
          mode === 'explore' ? check('opt.heads', opts.showHeads, function (v) { updateOpts({ showHeads: v }); }) : null,
          mode === 'explore' ? check('opt.residual', opts.showResidual, function (v) { updateOpts({ showResidual: v }); }) : null,
          mode === 'explore'
            ? slider('opt.spread', Number(opts.spread.toFixed(2)), 0.6, 2.4, 0.05, function (v) { updateOpts({ spread: v }); })
            : null),
        mode === 'explore'
          ? h('div', { className: 't3l-card' },
            h('div', { className: 't3l-cardhead' }, h('span', { className: 't3l-cardtitle' }, t('panel.view'))),
            h('div', { className: 't3l-btn-row' },
              h('button', { className: 't3l-btn', type: 'button', onClick: function () { if (apiRef.current) apiRef.current.setView('iso'); } }, t('btn.iso')),
              h('button', { className: 't3l-btn', type: 'button', onClick: function () { if (apiRef.current) apiRef.current.setView('front'); } }, t('btn.front')),
              h('button', { className: 't3l-btn', type: 'button', onClick: function () { if (apiRef.current) apiRef.current.setView('top'); } }, t('btn.top')),
              h('button', { className: 't3l-btn', type: 'button', onClick: function () { if (apiRef.current) apiRef.current.setView('side'); } }, t('btn.side'))))
          : null
      );

      /* ---------- right column ---------- */
      const pipelineCard = h('div', { className: 't3l-card' },
        h('div', { className: 't3l-cardhead' }, h('span', { className: 't3l-cardtitle' }, t('panel.pipeline'))),
        h('div', { className: 't3l-pipe' },
          PIPE.map(function (id, k) {
            return h('button', {
              key: id, type: 'button', className: 't3l-pipe-row',
              'data-active': step === k ? 'true' : 'false',
              onClick: function () { setPipePlaying(false); setStep(k); },
            },
              h('span', { className: 't3l-pipe-num' }, String(k + 1)),
              h('span', { className: 't3l-pipe-body' },
                h('span', { className: 't3l-pipe-name' }, t('stage.' + id)),
                h('span', { className: 't3l-pipe-f' }, t('f.' + id))));
          })),
        h('div', { className: 't3l-note' }, t('n.' + PIPE[step]))
      );

      const vectorCard = h('div', { className: 't3l-card' },
        h('div', { className: 't3l-cardhead' },
          h('span', { className: 't3l-cardtitle' }, t('panel.vector')),
          h('span', { className: 't3l-kv-v' }, t('chip.head', { n: headIndex2 + 1, word: selectedWord }))),
        h('div', { className: 't3l-kv' },
          h('span', { className: 't3l-kv-v', style: { fontSize: '13px', fontWeight: 600 } }, selectedWord),
          h('span', { className: 't3l-kv-k' }, t('vec.id', { id: TOY.ids[tokenIndex] }))),
        kvRow(t('vec.normQ'), head.qNorm[tokenIndex].toFixed(2)),
        kvRow(t('vec.normK'), head.kNorm[tokenIndex].toFixed(2)),
        h('div', { className: 't3l-cardtitle' }, t('vec.attn')),
        h('div', null,
          TOY.words.map(function (word, j) {
            const value = attnRow[j];
            const masked = j > tokenIndex;
            return h('div', { className: 't3l-wrow', key: 'att' + j },
              h('span', null, word),
              h('span', { className: 'bar' },
                h('i', { style: { width: (masked ? 0 : value * 100).toFixed(1) + '%' } })),
              h('span', { className: 'num' }, masked ? '—' : value.toFixed(2)));
          })),
        h('div', { className: 't3l-cardtitle' }, t('vec.dims')),
        h('div', null,
          (function () {
            const vec = model.x[tokenIndex];
            const rows = [];
            for (let c = 0; c < SHOW_DIM; c += 1) {
              const v = vec[c];
              const pct = clamp(Math.abs(v) * 22, 2, 100);
              rows.push(h('div', { className: 't3l-wrow', key: 'dim' + c },
                h('span', null, 'd' + c),
                h('span', { className: 'bar' },
                  h('i', {
                    style: {
                      width: pct.toFixed(1) + '%',
                      background: v >= 0 ? 'rgb(82,150,255)' : 'rgb(255,150,70)',
                    },
                  })),
                h('span', { className: 'num' }, v.toFixed(2))));
            }
            return rows;
          })())
      );

      const legendCard = h('div', { className: 't3l-card' },
        h('div', { className: 't3l-cardhead' }, h('span', { className: 't3l-cardtitle' }, t('panel.legend'))),
        h('div', { className: 't3l-legend' },
          legRow(COLOR.pos, t('legend.height'), 'l1'),
          legRow(COLOR.q, t('legend.qkv'), 'l2'),
          legRow(COLOR.attn, t('legend.plate'), 'l3'),
          legRow(COLOR.mask, t('legend.mask'), 'l4'),
          legRow(COLOR.head, t('legend.mix'), 'l5'),
          legRow(COLOR.ffn, t('legend.ffn'), 'l6'),
          legRow(COLOR.logit, t('legend.logits'), 'l7'))
      );

      const inspectorCard = h('div', { className: 't3l-card' },
        h('div', { className: 't3l-cardhead' }, h('span', { className: 't3l-cardtitle' }, t('panel.inspect'))),
        selectedNode && meta
          ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '7px' } },
            h('div', { className: 't3l-pipe-name' }, nodeTitle(selectedNode)),
            kvRow(t('insp.stage'), meta.stage || '—'),
            kvRow(t('insp.shape'), meta.shape || '—'),
            meta.layer != null ? kvRow(t('insp.layer'), String(meta.layer + 1)) : null,
            meta.params != null ? kvRow(t('insp.params'), formatCount(meta.params)) : null,
            meta.params != null
              ? h('div', { className: 't3l-meter' }, h('i', { style: { width: (share * 100).toFixed(2) + '%' } }))
              : null,
            meta.params != null
              ? h('div', { className: 't3l-row' },
                h('span', null, t('insp.share')),
                h('span', { className: 't3l-val' }, (share * 100).toFixed(share > 0.1 ? 1 : 2) + '%'))
              : null,
            meta.note ? h('div', { className: 't3l-note' }, meta.note) : null,
            h('div', { className: 't3l-btn-row' },
              h('button', { className: 't3l-btn', type: 'button', onClick: function () { if (apiRef.current) apiRef.current.focus(); } }, t('insp.focus')),
              h('button', { className: 't3l-btn', type: 'button', onClick: function () { setSelectedId(null); } }, t('insp.clear'))))
          : h('div', { className: 't3l-empty' }, t('insp.empty'))
      );

      const right = h('div', { className: 't3l-right' },
        mode === 'pipeline' ? pipelineCard : null,
        mode === 'pipeline' ? vectorCard : null,
        mode === 'pipeline' ? legendCard : inspectorCard,
        mode === 'explore' ? legendCard : null
      );

      /* ---------- bottom bar ---------- */
      const bottom = h('div', { className: 't3l-bottom' },
        h('span', null, mode === 'pipeline' ? t('hint.bar') : t('hint.drag')),
        h('div', { style: { flex: '1 1 auto' } }),
        mode === 'explore'
          ? h('div', { className: 't3l-chips' },
            chip(t('stat.params'), formatCount(scene.stats.total)),
            chip(t('stat.flops'), formatCount(scene.stats.flopsToken)),
            chip(t('stat.kv'), formatBytes(scene.stats.kvBytesPerToken)),
            chip(t('stat.depth'), String(scene.stats.d)))
          : h('div', { className: 't3l-chips' },
            chip(t('meter.top'), TOY.vocab[model.top] + ' ' + (model.probs[model.top] * 100).toFixed(0) + '%')),
        activeNode && activeNode.node && activeNode.node.meta
          ? h('span', null, h('b', null, activeNode.node.meta.stage))
          : null
      );

      const badge = mode === 'pipeline'
        ? h('div', { className: 't3l-badge' },
          h('span', { className: 't3l-pill', 'data-done': step === PIPE.length - 1 ? 'true' : 'false' },
            t('step.badge', { n: step + 1, name: t('stage.' + PIPE[step]) })))
        : null;

      return h('div', { className: 't3l-root' },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
        h('canvas', {
          className: 't3l-canvas', ref: canvasRef, role: 'img', 'aria-label': t('app.title'),
        }),
        header,
        badge,
        left,
        right,
        bottom,
        hover ? h('div', {
          className: 't3l-tip',
          style: { left: hover.x + 'px', top: hover.y + 'px' },
        }, nodeTitle(hover.node)) : null
      );
    }

    /* =====================================================================
     * 8. Plugin wiring
     * ===================================================================*/

    function effectOrRun(ctx, fn, label) {
      let ran = false;
      if (ctx && typeof ctx.effect === 'function') {
        try {
          ctx.effect(function () { ran = true; return fn(); }, label);
          return;
        } catch (e) {
          if (ran) return;
        }
      }
      try { fn(); } catch (e) { /* the panel simply does not mount without its slot */ }
    }

    function apply(ctx) {
      const loc = ctx.get('locale');
      if (loc) {
        localeFace = loc;
        effectOrRun(ctx, function () {
          const disposers = [];
          try {
            if (typeof loc.register === 'function') disposers.push(loc.register(NS, 'en', DICT_EN));
          } catch (e) { /* the namespace may already be registered */ }
          try {
            if (typeof loc.register === 'function') disposers.push(loc.register(NS, 'zh', DICT_ZH));
          } catch (e) { /* the namespace may already be registered */ }
          try {
            if (typeof loc.bind === 'function') boundTranslate = loc.bind(NS);
          } catch (e) { boundTranslate = null; }
          return function () {
            for (let i = 0; i < disposers.length; i += 1) {
              try { disposers[i](); } catch (e) { /* already disposed */ }
            }
            boundTranslate = null;
          };
        }, 'transformer3d:locale');
      }

      const slots = ctx.get('slots');
      if (!slots || typeof slots.inject !== 'function' || typeof slots.register !== 'function') return;

      effectOrRun(ctx, function () {
        return slots.inject('sidebar.panellist', function () {
          return slots.register({
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 20,
            label: function () { return t('app.title'); },
          }, PanelIcon);
        });
      }, 'transformer3d:panellist');

      effectOrRun(ctx, function () {
        return slots.inject('main', function () {
          return slots.register({ name: 'main', key: PANEL_ID }, LabPage);
        });
      }, 'transformer3d:main');
    }

    return {
      inject: ['slots'],
      apply: apply,
    };
  },
});
