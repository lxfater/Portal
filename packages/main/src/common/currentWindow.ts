const activeWindow = require('active-win');

class CurrentWindow {
  private id: string | null = null;
  async setTargetWindowPid() {
    const { id } = await activeWindow();
    console.log('setTargetWindowPid', id);
    this.id = id;
  }
  public async isTargetWindow() {
    const { id } = await activeWindow();
    console.log('isTargetWindow', id, this.id);
    return id === this.id;
  }
}

const currentWindow = new CurrentWindow();

export default currentWindow;