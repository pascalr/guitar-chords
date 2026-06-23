(() => {
    const partition = document.getElementById('divPartition');
    if (!partition) {
        console.error('divPartition not found');
        return;
    }

    let output = '';

    for (const line of partition.children) {
        if (line.classList.contains('pLVV')) {
            output += '\n';
            continue;
        }

        let text = '';

        function walk(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
                return;
            }

            if (
                node.nodeType === Node.ELEMENT_NODE &&
                node.classList.contains('a')
            ) {
                text += `[${node.dataset.aff}]`;
                return;
            }

            for (const child of node.childNodes) {
                walk(child);
            }
        }

        walk(line);

        text = text
            .replace(/\u00A0/g, ' ')
            .replace(/\s+$/g, '');

        output += text + '\n';
    }

    console.log(output);
    copy(output);
})();