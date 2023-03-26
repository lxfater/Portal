<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import Graph from 'graphology';
import Sigma from 'sigma';
import { useStore } from '../state';
import FA2Layout from 'graphology-layout-forceatlas2/worker';
import type { EdgeDisplayData, NodeDisplayData } from 'sigma/types';
const store = useStore();
const chatContainer = ref<HTMLElement>('');
const emit = defineEmits(['toggle']);
onMounted(() => {
    let graph = new Graph();
    const renderer = new Sigma(
        graph,
        chatContainer.value,
        {
            allowInvalidContainer: true,
            renderEdgeLabels: true,
        },
    );
    let maxChildren = Math.max(...Object.values(store.chat.history).map(h => h.next && Array.isArray(h.next) && h.next.length !== 0 ? h.next.length : 1));
    Object.values(store.chat.history).forEach(h => {
        const nextLength = h.next && Array.isArray(h.next) && h.next.length !== 0 ? h.next.length : 1;
        const roundedValue = Math.max(Math.round(30 * nextLength / maxChildren), 5);
        console.log(roundedValue, 'roundedValue');
        graph.addNode(h.time, {
            x: Math.random(),
            y: Math.random(),
            size: roundedValue,
            color: 'gray',
            label: h.question,
        });

    });
    Object.values(store.chat.history).forEach(h => {
        if (h.next) {
            h.next.forEach(n => {
                graph.addEdge(h.time, n, { type: 'arrow'});
            });
        }

    });
    const layout = new FA2Layout(graph, {
        settings: {
            barnesHutOptimize: true,
            barnesHutTheta: 0.5,
            scalingRatio: 10,
            strongGravityMode: true,
            gravity: 10,
            slowDown: 1,
            outboundAttractionDistribution: true,
            linLogMode: true,
            adjustSizes: true,
            edgeWeightInfluence: 0,
        },
    });
    layout.start();

    setTimeout(() => {
        layout.stop();
    }, 200);
    // Type and declare internal state:
    interface State {
        hoveredNode?: string;
        searchQuery: string;

        // State derived from query:
        selectedNode?: string;
        suggestions?: Set<string>;

        // State derived from hovered node:
        hoveredNeighbors?: Set<string>;
    }
    const state: State = { searchQuery: '' };


    function setHoveredNode(node?: string) {
        if (node) {
            state.hoveredNode = node;
            state.hoveredNeighbors = new Set(graph.neighbors(node));
        } else {
            state.hoveredNode = undefined;
            state.hoveredNeighbors = undefined;
        }

        // Refresh rendering:
        renderer.refresh();
    }



    // Bind graph interactions:
    renderer.on('enterNode', ({ node }) => {
        setHoveredNode(node);
    });
    renderer.on('leaveNode', () => {
        setHoveredNode(undefined);
    });


    renderer.setSetting('nodeReducer', (node, data) => {
        const res: Partial<NodeDisplayData> = { ...data };

        if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
            res.label = '';
            res.color = '#f6f6f6';
        }

        if (state.selectedNode === node) {
            res.highlighted = true;
        } else if (state.suggestions && !state.suggestions.has(node)) {
            res.label = '';
            res.color = '#f6f6f6';
        }

        return res;
    });

    renderer.setSetting('edgeReducer', (edge, data) => {
        const res: Partial<EdgeDisplayData> = { ...data };

        if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
            res.hidden = true;
        }

        if (state.suggestions && (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))) {
            res.hidden = true;
        }

        return res;
    });

    renderer.on('downNode', (e) => {
        emit('toggle', e.node);
        nextTick(() => {
            try {
                const container = document.getElementById('chatbox');
                const element = document.querySelector(`[data-id="${parseInt(e.node)}"]`);
                if (element) {
                    var containerRect = container!.getBoundingClientRect();
                    var elementRect = element!.getBoundingClientRect();
                    var scrollX = elementRect.left - containerRect.left - container!.offsetWidth / 2;
                    var scrollY = elementRect.top - containerRect.top - container!.offsetHeight / 2;
                    // 将 div 滚动到合适的位置
                    container!.scrollBy({
                        left: scrollX,
                        top: scrollY,
                        behavior: 'smooth',
                    });
                }

            } catch (error) {
                console.log(error);
            }

        });
    });
});

</script>

<template>
  <div
    ref="chatContainer"
    class="chatContainer"
  >
  </div>
</template>

<style lang="scss">
.chatContainer {
    height: 100%;
}
</style>