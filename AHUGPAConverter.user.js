// ==UserScript==
// @name         安大教务四分制绩点转换
// @namespace    https://www.skymkmk.com
// @version      0.6
// @description  将你的平均绩点从五分制转换为四分制，方便你比对心仪海外高校
// @author       skymkmk
// @match        *://jwxt0.ahu.edu.cn/*
// @match        *://jwxt1.ahu.edu.cn/*
// @match        *://jwxt2.ahu.edu.cn/*
// @match        *://jwxt3.ahu.edu.cn/*
// @match        *://jwxt4.ahu.edu.cn/*
// @match        *://wvpn.ahu.edu.cn/https/77726476706e69737468656265737421fae05988777e69586b468ca88d1b203b/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  const excludeCode = /T[Y,X]/;
  const excludeCourse = /军事|心理健康|职业|形式与政策/;
  const oneCreditCourse = /毛泽东|马克思|思想|史|习近平/;
  const twoCreditCourse = /大学英语/;
  let sumPKU = 0;
  let sumWES = 0;
  let creditPKU = 0;
  let creditWES = 0;
  let avgPKU = 0;
  let avgWES = 0;
  let WESExcludedCourse = new Array();
  let WESDecreasedCredit = new Map();
  const table = document.getElementById("Datagrid3").firstElementChild.children;
  const board = document.createElement('div');
  document.getElementById("divWtgkc").parentElement.insertBefore(board, document.getElementById("Datagrid3").parentElement);
  function WESPointCalculator(point) {
    if (point === "优秀" || point === "良好") return 4;
    if (point === "中等") return 3;
    if (point === "合格") return 2;
    if (parseInt(point) > 84) return 4;
    if (parseInt(point) > 74) return 3;
    if (parseInt(point) > 60) return 2;
    return 0;
  }
  function nodeGen(msg, color = 'black') {
    const node = document.createElement('p');
    node.innerHTML = msg;
    node.style = 'margin: 0; color:' + color + ';';
    return node;
  }
  if (table !== null) {
    for (const i of table) {
      if (i.children[6].innerHTML !== "最高成绩值") {
        const code = i.children[2].innerHTML;
        const courseName = i.children[3].innerHTML;
        const credit = parseFloat(i.children[4].innerHTML);
        const point = i.children[6].innerHTML;
        creditPKU += parseFloat(i.children[4].innerHTML);
        if (point === "优秀") {
          sumPKU += credit * 3.95;
        } else if (point === "良好") {
          sumPKU += credit * 3.58;
        } else if (point === "中等") {
          sumPKU += credit * 2.83;
        } else if (point === "合格") {
          sumPKU += credit * 1.7;
        } else {
          const pointNum = parseInt(point);
          if (pointNum >= 60) {
            sumPKU += credit * (4 - (3 * (100 - pointNum) ** 2) / 1600);
          }
        }
        if (!excludeCode.test(code)) {
          if (excludeCourse.test(courseName)) {
            WESExcludedCourse.push(courseName);
          } else if (oneCreditCourse.test(courseName)) {
            WESDecreasedCredit.set(courseName, 1);
            creditWES += 1;
            sumWES += WESPointCalculator(point);
          } else if (twoCreditCourse.test(courseName)) {
            WESDecreasedCredit.set(courseName, 2);
            creditWES += 2;
            sumWES += 2 * WESPointCalculator(point);
          } else {
            creditWES += credit;
            sumWES += credit * WESPointCalculator(point);
          }
        } else WESExcludedCourse.push(courseName);
      }
    }
    avgPKU = Math.round((sumPKU / creditPKU) * 100) / 100;
    avgWES = Math.round((sumWES / creditWES) * 100) / 100;
    board.appendChild(nodeGen('四分制绩点', 'blue'));
    board.appendChild(nodeGen('北大算法：' + avgPKU.toString(), 'red'));
    board.appendChild(nodeGen('WES 算法：' + avgWES.toString(), 'red'));
    board.appendChild(nodeGen('WES 算法排除的课程：', 'red'));
    for(const i of WESExcludedCourse) board.appendChild(nodeGen(i));
    board.appendChild(nodeGen('WES 算法降重的课程：', 'red'));
    for(const [key, value] of WESDecreasedCredit) board.appendChild(nodeGen(key + '，降重后的学分为' + value));
  }
})();
