export function downloadPython(code, name = "pypath.py") {
  try {
    const blob = new Blob([code], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.endsWith(".py") ? name : name + ".py";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    throw new Error("The browser could not start the Python file download. Please check your browser download permissions and try again.");
  }
}
