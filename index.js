class Node { // внутри функции для работы с узлами дерева решений
    constructor(matrix, bound, route) {
      this.matrix = matrix;
      this.bound = bound;
      this.route = route;
    }
  
    // делает независимую копию исходной матрицы
    static cloneMatrix(matrix) {
      return matrix.map((row) => row.slice());
    }
  
    // находит минимум для каждой строки
    static rowMins(matrix) {
      const mins = [];
      for (let row = 0; row < matrix.length; row += 1) {
        mins[row] = matrix[row][0];
      }
  
      // ищет минимальный элемент в каждой строке
      for (let row = 0; row < matrix.length; row += 1) {
        for (let column = 1; column < matrix.length; column += 1) {
          if (mins[row] > matrix[row][column]) {
            mins[row] = matrix[row][column];
          }
        }
      }
      // находит сумму минимальных элементов
      mins.sumFinites = function sumFinites() {
        return this.reduce((a, b) => (isFinite(b) ? a + b : a), 0);
      };
  
      return mins;
    }
  
    // находит минимум для каждого столбца
    static columnMins(matrix) {
      const mins = [];
      for (let column = 0; column < matrix.length; column += 1) {
        mins[column] = matrix[column][0];
      }
  
      for (let row = 1; row < matrix.length; row += 1) {
        for (let column = 0; column < matrix.length; column += 1) {
          if (mins[column] > matrix[row][column]) {
            mins[column] = matrix[row][column];
          }
        }
      }
  
      mins.sumFinites = function sumFinites() {
        return this.reduce((a, b) => (isFinite(b) ? a + b : a), 0);
      };
  
      return mins;
    }
  
    // редукция по строкам
    static reduceRows(matrix, mins) {
      for (let row = 0; row < matrix.length; row += 1) {
        for (let column = 0; column < matrix.length; column += 1) {
          if (isFinite(mins[row])) {
            matrix[row][column] = matrix[row][column] - mins[row];
          }
        }
      }
    }
  
    // редукция по столбцам
    static reduceColumns(matrix, mins) {
      for (let row = 0; row < matrix.length; row += 1) {
        for (let column = 0; column < matrix.length; column += 1) {
          if (isFinite(mins[column])) {
            matrix[row][column] = matrix[row][column] - mins[column];
          }
        }
      }
    }
  
    // редуцирует матрицу по строкам и столбцам и возвращает нижнюю границу
    static reduce(matrix) {
      const rowMins = Node.rowMins(matrix);
      Node.reduceRows(matrix, rowMins);
  
      const columnMins = Node.columnMins(matrix);
      Node.reduceColumns(matrix, columnMins);
  
      return rowMins.sumFinites() + columnMins.sumFinites();
    }
  
    //  возвращает нулевой элемент с максимальным штрафом в формате [row, сolumn, maxPenalty]
    getCellWithMaxPenalty() {
      let maxPenalty = -Infinity;
      let cellWithMaxPenalty = null;
      for (let row = 0; row < this.matrix.length; row += 1) {
        for (let column = 0; column < this.matrix.length; column += 1) {
          if (this.matrix[row][column] === 0) {
            let rowMin = Infinity;
            for (let i = 0; i < this.matrix.length; i += 1) {
              if (!isFinite(this.matrix[row][i]) || i === column) {
                continue;
              }
  
              if (rowMin > this.matrix[row][i]) {
                rowMin = this.matrix[row][i];
              }
            }
  
            let columnMin = Infinity;
            for (let i = 0; i < this.matrix.length; i += 1) {
              if (!isFinite(this.matrix[i][column]) || i === row) {
                continue;
              }
  
              if (columnMin > this.matrix[i][column]) {
                columnMin = this.matrix[i][column];
              }
            }
  
            const penalty = rowMin + columnMin;
            if (maxPenalty < penalty) {
              maxPenalty = penalty;
              cellWithMaxPenalty = [row, column, maxPenalty];
            }
          }
        }
      }
  
      return cellWithMaxPenalty;
    }
  }
  
  const isFinite = (value) => Number.isFinite(value);
  
  const findNextStartCity = (edges, startCity) => {
    for (let i = 0; i < edges.length; i += 1) {
      if (edges[i][1] === startCity) {
        return i;
      }
    }
  
    return -1;
  };
  
  const findNextEndCity = (edges, endCity) => {
    for (let i = 0; i < edges.length; i += 1) {
      if (edges[i][0] === endCity) {
        return i;
      }
    }
  
    return -1;
  };
  
  const getCloseEdges = (route) => {
    const result = [];
    const edges = [...route];
  
    while (edges.length > 0) {
      let length = 1;
      let startCity = edges[0][0];
      let endCity = edges[0][1];
      edges.splice(0, 1);
  
      let index = findNextStartCity(edges, startCity);
      while (index !== -1) {
        length += 1;
        [startCity] = edges[index];
        edges.splice(index, 1);
        index = findNextStartCity(edges, startCity);
      }
  
      index = findNextEndCity(edges, endCity);
      while (index !== -1) {
        length += 1;
        [, endCity] = edges[index];
        edges.splice(index, 1);
        index = findNextEndCity(edges, endCity);
      }
  
      if (length >= 2) {
        result.push([endCity, startCity]);
      }
    }
  
    return result;
  };
  
  const makeChildren = (minNode) => {
    const [row, column, leftPenalty] = minNode.getCellWithMaxPenalty();
  
    const leftMatrix = Node.cloneMatrix(minNode.matrix);
    leftMatrix[row][column] = Infinity;
    Node.reduce(leftMatrix);
    const leftBound = minNode.bound + leftPenalty;
    const leftRoute = [...minNode.route];
    const leftChild = new Node(leftMatrix, leftBound, leftRoute);
  
    const rightMatrix = Node.cloneMatrix(minNode.matrix);
    rightMatrix[column][row] = Infinity;
    for (let i = 0; i < rightMatrix.length; i += 1) {
      rightMatrix[row][i] = Infinity;
      rightMatrix[i][column] = Infinity;
    }
  
    const rightRoute = [...minNode.route, [row, column]];
    const closeEdges = getCloseEdges(rightRoute);
    closeEdges.forEach(([currRow, currEdge]) => {
      rightMatrix[currRow][currEdge] = Infinity;
    });
  
    const rightPenalty = Node.reduce(rightMatrix);
    const rightBound = minNode.bound + rightPenalty;
    const rightChild = new Node(rightMatrix, rightBound, rightRoute);
  
    return [leftChild, rightChild];
  };
  
  const little = (matrix) => {
    const rootMatrix = Node.cloneMatrix(matrix);
    const minBound = Node.reduce(rootMatrix);
    const root = new Node(rootMatrix, minBound, []);
    const priorityQueue = [root];
    let record = null;
  
    while (priorityQueue.length > 0) {
      let minIndex = 0;
      let minNode = priorityQueue[minIndex];
      for (let i = 1; i < priorityQueue.length; i += 1) {
        if (minNode.bound > priorityQueue[i].bound) {
          minNode = priorityQueue[i];
          minIndex = i;
        }
      }
  
      priorityQueue.splice(minIndex, 1);
  
      if (record !== null) {
        if (record.length <= minNode.bound) {
          break;
        }
      }
  
      if (minNode.route.length === matrix.length - 2) {
        for (let row = 0; row < matrix.length; row += 1) {
          for (let column = 0; column < matrix.length; column += 1) {
            if (isFinite(minNode.matrix[row][column])) {
              minNode.bound += minNode.matrix[row][column];
              minNode.route.push([row, column]);
            }
          }
        }
  
        if (record == null || record.length > minNode.bound) {
          record = { length: minNode.bound, route: minNode.route };
        }
      } else {
        const [leftChild, rightChild] = makeChildren(minNode);
  
        priorityQueue.push(leftChild);
        priorityQueue.push(rightChild);
      }
    }
  
    return record;
  };
  
  const matrix = [
    [Infinity, 27, 43, 16, 30, 26],
    [7, Infinity, 16, 1, 30, 25],
    [20, 13, Infinity, 35, 5, 0],
    [21, 16, 25, Infinity, 18, 18],
    [12, 46, 27, 48, Infinity, 5],
    [23, 5, 5, 9, 5, Infinity],
  ];
  
  console.log(little(matrix));
  // {
  //   length: 63,
  //   route: [ [ 0, 3 ], [ 1, 0 ],
  //            [ 4, 5 ], [ 2, 4 ],
  //            [ 3, 2 ], [ 5, 1 ] ]
  // }