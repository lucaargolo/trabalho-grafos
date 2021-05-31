const url = new URL(window.location.href);
const algorithm = url.searchParams.get("algorithm")
const encoded_graph = url.searchParams.get("graph");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let graph = new Graph(drawCanvas)
if(encoded_graph != null) {
    try {
        graph = decodeGraph(encoded_graph, drawCanvas)
    }catch (err) {
        console.error(err.message)
    }
}

function importGraph() {
    navigator.clipboard.readText()
        .then(text => {
            graph = decodeGraph(text, drawCanvas)
            drawCanvas(drawingEdge)
            alert("Grafo da área de transferência importado com sucesso!")
        })
        .catch(err => {
            alert("Houve um erro ao importar o grafo da área de transferência. Certifique-se de que sua área de transferência possui de fato um grafo.")
            console.error(err.message)
        })
}

function exportGraph() {
    navigator.clipboard.writeText(encodeGraph(graph))
        .then(() => {
            alert("Grafo exportado para a área de transferência com sucesso!")
        })
        .catch(err => {
            alert("Houve um erro ao exportar o grafo para a área de transferência. Certifique-se de que o site possuí permissão para efetuar essa ação.")
            console.error(err.message)
        })
}

function goToVisualization() {
    let v = algorithms[algorithm].verify(graph)
    if(v !== null) {
        alert(v)
    }else {
        window.location = "graph_visualization.html?algorithm=" + algorithm + "&graph=" + encodeGraph(graph)
    }
}

let onCanvas = false
let mx = 0
let my = 0

let draggingVertice = null
let drawingEdge = null

document.body.onmousemove = function (event) {
    let rect = canvas.getBoundingClientRect();
    if(event.x >= rect.left && event.x <= rect.right && event.y >= rect.top && event.y <= rect.bottom) {
        onCanvas = true
        mx = event.x - rect.left
        my = event.y - rect.top
        if(draggingVertice != null) {
            let backupX = draggingVertice.x
            let backupY = draggingVertice.y
            draggingVertice.x = mx
            draggingVertice.y = my
            if(graph.isVerticeColliding(draggingVertice)) {
                draggingVertice.x = backupX
                draggingVertice.y = backupY
            }
        }else if(graph.selectedVertice != null && drawingEdge != null) {
            drawingEdge = new Edge(graph.selectedVertice, new Vertice(mx, my), drawingEdge.directed)
        }
        drawCanvas(drawingEdge)
    }else{
        onCanvas = false
    }
}

document.body.oncontextmenu = function (event) {
    if(onCanvas) {
        event.preventDefault()
    }
}

document.body.onmousedown = function (event) {
    if(onCanvas) {
        let vertice = graph.getVertice(mx, my)
        let edge = graph.getEdge(mx, my)
        if(event.button === 0) {
            if (event.shiftKey) {
                if (vertice != null && graph.selectedVertice != null && vertice !== graph.selectedVertice) {
                    let edge = new Edge(graph.selectedVertice, vertice, false)
                    graph.addEdge(edge)
                    graph.selectedEdge = edge
                    graph.selectedVertice = null
                }
            } else if(event.ctrlKey) {
                if (vertice != null && graph.selectedVertice != null && vertice !== graph.selectedVertice) {
                    let edge = new Edge(graph.selectedVertice, vertice, true)
                    graph.addEdge(edge)
                    graph.selectedEdge = edge
                    graph.selectedVertice = null
                }
            } else {
                draggingVertice = vertice
                graph.selectedVertice = vertice
                if(vertice === null) {
                    graph.selectedEdge = edge
                }else{
                    graph.selectedEdge = null
                }
            }
        }else if(event.button === 2) {
            if(vertice !== null) {
                graph.removeVertice(vertice)
            }else{
                graph.removeEdge(edge)
            }
        }
        drawCanvas(drawingEdge)
    }
}

document.body.onmouseup = function (event) {
    if(onCanvas) {
        if(event.button === 0) {
            if(draggingVertice != null) {
                draggingVertice = null
            }else if (graph.selectedEdge == null && graph.getVertice(mx, my) == null) {
                let vertice = new Vertice(mx, my)
                let created = graph.addVertice(vertice)
                if(created) {
                    graph.selectedVertice = vertice
                    graph.selectedEdge = null
                }
            }
        }
        drawCanvas(drawingEdge)
    }
}

document.body.onkeyup = function (event) {
    switch (event.key) {
        case '+':
            if(graph.selectedVertice !== null) {
                graph.selectedVertice.value++
            }else if(graph.selectedEdge !== null) {
                graph.selectedEdge.value++
            }
            break
        case '-':
            if(graph.selectedVertice !== null) {
                graph.selectedVertice.value--
            }else if(graph.selectedEdge !== null) {
                graph.selectedEdge.value--
            }
            break
        case 's':
            if(graph.selectedVertice !== null) {
                if (graph.selectedVertice === graph.endVertice) {
                    graph.endVertice = graph.startVertice
                    graph.startVertice = graph.selectedVertice
                } else if (graph.selectedVertice === graph.startVertice) {
                    graph.startVertice = null
                } else {
                    graph.startVertice = graph.selectedVertice
                }
            }
            break
        case 'e':
            if(graph.selectedVertice !== null) {
                if (graph.selectedVertice === graph.startVertice) {
                    graph.startVertice = graph.endVertice
                    graph.endVertice = graph.selectedVertice
                } else if (graph.selectedVertice === graph.endVertice) {
                    graph.endVertice = null
                } else {
                    graph.endVertice = graph.selectedVertice
                }
            }
            break
        default:
            break
    }
    if(onCanvas && !event.shiftKey && !event.ctrlKey) {
        drawingEdge = null
    }
    drawCanvas(drawingEdge)
}

document.body.onkeydown = function (event) {
    if(onCanvas && graph.selectedVertice != null) {
        if(event.shiftKey) {
            drawingEdge = new Edge(graph.selectedVertice, new Vertice(mx, my), false)
            drawCanvas(drawingEdge)
        }else if(event.ctrlKey) {
            drawingEdge = new Edge(graph.selectedVertice, new Vertice(mx, my), true)
            drawCanvas(drawingEdge)
        }
    }
}

drawCanvas(drawingEdge)