// 示例数据
// const data = [
//   [3, 2, 2, 9, 2, 12, 11, 16, 5, 20, 9, 7, 19, 10, 5, 2, 4, 19, 17, 20, 11, 9, 12, 5, 13, 7, 12, 8, 6, 11, 14, 19, 12, 3, 14, 3, 8, 2, 13, 8, 5],
//   [6, 17, 10, 2, 7, 8, 16, 6, 3, 9, 18, 5, 16, 15, 11, 18, 15, 10, 2, 12, 3, 19, 4, 5, 8, 14, 3, 3], // 列2
//   [3, 15, 19, 3, 17, 20, 4, 14, 7, 12, 14, 11, 18, 7, 14, 7, 15, 5, 3, 14, 3, 3, 12, 12, 2, 12, 16, 20, 17, 4, 14]  // 列3
// ];
// 计算结果
// const result = anova(data);
// console.log("SS_between:", result.SS_between);
// console.log("SS_within:", result.SS_within);
// console.log("SS_total:", result.SS_total);
// console.log("DF_between:", result.DF_between);
// console.log("DF_within:", result.DF_within);
// console.log("MS_between:", result.MS_between);
// console.log("MS_within:", result.MS_within);
// console.log("F:", result.F);
// console.log("P-value:", result.pValue);

import jStat from 'jstat';
export interface chartDataItem {
  groupName: string[],
  groupData: number[][]
}

// 计算每一组的统计值
function calculateGroupStats(data: number[][]) {
  const groupSums = data.map(group => group.reduce((a, b) => a + b, 0));
  const groupMeans = groupSums.map((sum, i) => sum / data[i].length);
  const groupSS = data.map((group, i) =>
    group.reduce((sum, value) => sum + Math.pow(value - groupMeans[i], 2), 0)
  );

  return { groupSums, groupMeans, groupSS };
}

// 方差分析结果
function getStatistics(chartDataItem: chartDataItem) {
  const groupName = chartDataItem.groupName;
  const data = chartDataItem.groupData;
  const res = data.map((group, index) => {
    const count = group.length; // 观测数
    const sum = group.reduce((a, b) => a + b, 0); // 求和
    const mean = sum / count; // 平均值
    const variance =
      group.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / count; // 方差
    const stdDev = Math.sqrt(variance); // 标准差

    return {
      group: groupName[index],
      count,
      sum,
      mean: mean.toFixed(4), // 保留4位小数
      variance: variance.toFixed(4), // 保留4位小数
      stdDev: stdDev.toFixed(4), // 保留4位小数
    };
  })
  return res
}

// 计算方差分析中的SS, df, MS, F, P-value
export function anova(chartDataItem: chartDataItem) {
  const data = chartDataItem.groupData;
  const n = data.flat().length; // 总观测数
  const numGroups = data.length; // 组数

  const { groupSums, groupMeans, groupSS } = calculateGroupStats(data);

  // 总均值
  const grandMean = data.flat().reduce((a: number, b: number): number => a + b, 0) / n;

  // 计算组间平方和 (SS_between)
  const SS_between = groupMeans.reduce((sum: number, mean: number, i: number) => sum + data[i].length * Math.pow(mean - grandMean, 2), 0);

  // 计算组内平方和 (SS_within)
  const SS_within = groupSS.reduce((a: number, b: number) => a + b, 0);

  // 总平方和
  const SS_total = SS_between + SS_within;

  // 自由度
  const DF_between = numGroups - 1;
  const DF_within = n - numGroups;
  const DF_total = DF_between + DF_within;

  if (DF_within <= 0) {
    return {
      SS_between: 0, // 组间-平方和
      SS_within: 0, // 组内-平方和
      SS_total: 0, // 总计-平方和
      DF_between: 0, // 组间-自由度
      DF_within: 0, // 组间-自由度
      DF_total: 0, // 组间-自由度
      MS_between: 0, // 组间-均方
      MS_within: 0,// 组内-均方
      F: 0,// F
      pValue: 0,// P
      Statistics: [],
      error: "组内自由度为零，无法计算 F 值。请确保每组至少有两个数据点。"
    };
  }

  // 均方
  const MS_between = SS_between / DF_between;
  const MS_within = SS_within / DF_within;

  // F 值
  const F = MS_between / MS_within;

  // 使用 jStat 库计算 P-value (确保 jStat 被引入)
  const pValue = 1 - jStat.centralF.cdf(F, DF_between, DF_within);

  return {
    SS_between: SS_between.toFixed(3), // 组间-平方和
    SS_within: SS_within.toFixed(3), // 组内-平方和
    SS_total: SS_total.toFixed(3), // 总计-平方和
    DF_between, // 组间-自由度
    DF_within, // 组间-自由度
    DF_total, // 组间-自由度
    MS_between: MS_between.toFixed(3), // 组间-均方
    MS_within: MS_within.toFixed(3), // 组内-均方
    F: F.toFixed(3), // F
    pValue: pValue.toFixed(3), // P
    Statistics: getStatistics(chartDataItem)
  };
}


// 示例数据
// const X = [1, 2, 3, 4];
// const Y = [5.2, 5.7, 5, 4.2];

// 执行线性回归分析
// const result = linearRegression(X, Y);
// console.log(result);


// 封装线性回归函数

// 定义回归分析结果类型
export interface RegressionResults {
  B: string[]; // 回归系数
  beta: string[]; // 标准化回归系数 (Beta 值)
  rSquare: string; // R²
  adjustedRSquare: string; // 调整后的 R²
  standardErrors: string[]; // 标准误差
  tStats: string[]; // t 统计量
  pValues: string[]; // p 值
  vif: string[]; // VIF 值
  tolerance: string[]; // 容忍度
  F: string; // F 值
  dw: string; // 杜宾-沃森值
}

// 转置 X
export function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// 计算线性回归以及相关统计量
export function linearRegressionWithStats(
  X: number[][],
  Y: number[],
  confidenceLevel: number = 0.95
): RegressionResults {
  const n = Y.length; // 样本数量
  const k = Array.isArray(X[0]) ? X[0].length : 1; // 自变量数量（如果 X 是单变量，设置为 1）

  // 将 X 标准化为二维数组（单变量情况会转为二维数组）
  const standardizedX = Array.isArray(X[0]) ? X : X.map(val => [val]);
  const XWithIntercept = standardizedX.map(row => [1, ...row]); // 添加截距项
  const YArray = Y.map(value => [value]); // 转为二维数组

  // 计算回归系数 (Beta) = (X'X)^(-1) * X'Y
  const Xt = jStat.transpose(XWithIntercept); // X 转置
  const XtX = jStat.multiply(Xt, XWithIntercept); // X'X
  const XtXInv = jStat.inv(XtX); // (X'X)^(-1)
  const XtY = jStat.multiply(Xt, YArray); // X'Y
  const beta = jStat.multiply(XtXInv, XtY).flat(); // Beta 系数

  // 预测值和残差
  const Y_hat = jStat.multiply(XWithIntercept, beta.map(b => [b])).flat(); // Y_hat = X * Beta
  const residuals = Y.map((y, i) => y - Y_hat[i]); // 残差

  // 残差平方和 (SSR)
  const residualSS = jStat.sum(residuals.map(r => r ** 2));

  // 总平方和 (SST)
  const Y_mean = jStat.mean(Y);
  const totalSS = jStat.sum(Y.map(y => (y - Y_mean) ** 2));

  // 回归平方和 (SSR_reg)
  const regressionSS = totalSS - residualSS;

  // R² 和调整后的 R²
  const rSquare = 1 - residualSS / totalSS;
  const adjustedRSquare = 1 - (1 - rSquare) * (n - 1) / (n - k - 1);

  // 均方误差 (MSE) 和残差自由度
  const dfRes = n - k - 1;
  const MS_res = residualSS / dfRes;

  // 标准误差、t 值、p 值和置信区间
  const standardErrors: number[] = [];
  const tStats: number[] = [];
  const pValues: number[] = [];

  for (let j = 0; j < beta.length; j++) {
    const SE = Math.sqrt(MS_res * XtXInv[j][j]); // 标准误差
    standardErrors.push(SE);
    const tStat = beta[j] / SE; // t 统计量
    tStats.push(tStat);
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), dfRes)); // p 值
    pValues.push(pValue);
  }

  // F 值计算
  const MS_reg = regressionSS / k; // 回归均方
  const F = MS_reg / MS_res; // F 值

  // VIF 和 Tolerance
  const vif: number[] = [];
  const tolerance: number[] = [];

  for (let j = 1; j < XWithIntercept[0].length; j++) {
    const subX = XWithIntercept.map(row => row.filter((_, colIndex) => colIndex !== j));
    const subY = XWithIntercept.map(row => row[j]);
    const subXt = jStat.transpose(subX);
    const subXtX = jStat.multiply(subXt, subX);
    const subXtXInv = jStat.inv(subXtX);
    const subBeta = jStat.multiply(subXtXInv, jStat.multiply(subXt, subY.map(val => [val]))).flat();
    const subY_hat = jStat.multiply(subX, subBeta.map(b => [b])).flat();
    const subResiduals = subY.map((y, i) => y - subY_hat[i]);
    const subR2 = 1 - jStat.sum(subResiduals.map(r => r ** 2)) / jStat.sum(subY.map(y => y ** 2));
    const tol = 1 - subR2; // 容忍度
    if (XWithIntercept[0].length <= 2) {
      tolerance.push(1);
      vif.push(1); // VIF
    } else {
      tolerance.push(tol);
      vif.push(1 / tol); // VIF
    }
  }

  // Durbin-Watson 值计算
  const dw = residuals.reduce(
    (sum, e, i) => (i > 0 ? sum + Math.pow(e - residuals[i - 1], 2) : sum),
    0
  ) / residuals.reduce((sum, e) => sum + Math.pow(e, 2), 0);

  // 标准化回归系数 Beta 值计算
  // const stdX = jStat.transpose(standardizedX).map(col => jStat.stdev(col)); // 每个变量的标准差
  let stdX: number[];

  // 判断单变量还是多变量
  if (standardizedX[0].length === 1) {
    // 单变量时计算标准差
    stdX = [jStat.stdev(standardizedX.map(row => row[0]))];
  } else {
    // 多变量时按列计算标准差
    stdX = standardizedX[0].map((_, i) => jStat.stdev(standardizedX.map(row => row[i])));
  }
  const stdY = jStat.stdev(Y); // 因变量的标准差
  const betaStandardized = beta.slice(1).map((b, i) => {
    if (stdX[i] === 0 || stdY === 0) {
      return 0; // 如果标准差为零，标准化系数设置为零
    }
    return b * (stdX[i] / stdY);
  }); // 忽略截距项
  // 将所有结果保留三位小数
  const format = (value: number) => value == 0 ? '-' : value.toFixed(3); // 格式化函数

  return {
    B: beta.map(format) || '', // 回归系数
    beta: [0, ...betaStandardized].map(format), // 标准化回归系数，保留截距
    rSquare: format(rSquare), // R²
    adjustedRSquare: format(adjustedRSquare), // 调整后的 R²
    standardErrors: standardErrors.map(format), // 标准误差
    tStats: tStats.map(format), // t 统计量
    pValues: pValues.map(format), // p 值
    vif: vif.map(format), // VIF
    tolerance: tolerance.map(format), // 容忍度
    F: format(F), // F 值
    dw: format(dw), // Durbin-Watson 值
  };
}

// 线性回归包含字符串判断
export function validateData(X, Y) {
  // 检查 X 是否为二维数组，并且所有元素都是有效数字
  const isXValid = Array.isArray(X) && X.every(
    row => Array.isArray(row) && row.every(value => typeof value === 'number' && !isNaN(value))
  );

  // 检查 Y 是否为一维数组，并且所有元素都是有效数字
  const isYValid = Array.isArray(Y) && Y.every(value => typeof value === 'number' && !isNaN(value));

  if (!isXValid) {
    return { valid: false, error: "X 包含无效值（非数字或 NaN）或不是二维数组" };
  }

  if (!isYValid) {
    return { valid: false, error: "Y 包含无效值（非数字或 NaN）或不是一维数组" };
  }

  return { valid: true, error: null };
}

export function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}