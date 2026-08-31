async function loadIncludes() {
    const nodes = document.querySelectorAll('[data-include]');
    await Promise.all([...nodes].map(async node => {
        const res = await fetch(node.dataset.include);
        node.outerHTML = await res.text();
    }));
    document.dispatchEvent(new Event('includesLoaded'));
}
loadIncludes();