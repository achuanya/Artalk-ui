import EditorPlugin from './_plug'

export default class Collapsible extends EditorPlugin {
  private isCollapsed = true
  private expandTimeout: NodeJS.Timeout | null = null
  private sections = ['textarea', 'bottom', 'header', 'panel', 'notify', 'submit']
  private expandDelay = 100

  constructor(kit: any) {
    super(kit)
    this.init()
  }

  private init() {
    const editor = this.kit.useEditor()
    const $commentBox = editor.getEl().closest('.atk-comment-box') as HTMLElement
    
    if (!$commentBox) return

    // 初始化折叠状态
    this.setCollapsedState(true)
    
    this.bindClickEvent($commentBox)
    
    this.bindTextareaFocusEvent()
  }

  private bindClickEvent($commentBox: HTMLElement) {
    const clickHandler = (e: Event) => {
      // 如果已经展开，不处理点击
      if (!this.isCollapsed) return
      
      // 阻止事件冒泡
      e.stopPropagation()
      
      // 展开编辑器
      this.expand()
    }

    $commentBox.addEventListener('click', clickHandler)
  }

  private bindTextareaFocusEvent() {
    const editor = this.kit.useEditor()
    const $textarea = editor.getUI().$textarea
    
    if (!$textarea) return

    $textarea.addEventListener('focus', () => {
      if (this.isCollapsed) {
        this.expand()
      }
    })
  }

  private setCollapsedState(collapsed: boolean) {
    const editor = this.kit.useEditor()
    const $commentBox = editor.getEl().closest('.atk-comment-box') as HTMLElement
    
    if (!$commentBox) return

    this.isCollapsed = collapsed
    
    if (collapsed) {
      $commentBox.classList.add('atk-collapsed')
      // 隐藏所有部分，只保留 textarea
      const hiddenSections = ['bottom', 'header', 'panel', 'notify', 'submit']
      hiddenSections.forEach((section) => {
        const $section = $commentBox.querySelector(`[data-section="${section}"]`) as HTMLElement
        if ($section) {
          $section.style.display = 'none'
          $section.classList.remove('atk-expanding')
        }
      })
    } else {
      $commentBox.classList.remove('atk-collapsed')
    }
  }

  private expand() {
    if (!this.isCollapsed) return

    const editor = this.kit.useEditor()
    const $commentBox = editor.getEl().closest('.atk-comment-box') as HTMLElement
    
    if (!$commentBox) return

    this.isCollapsed = false
    $commentBox.classList.remove('atk-collapsed')

    // 依次展开各个部分
    this.expandSections($commentBox)
  }

  private expandSections($commentBox: HTMLElement) {
    // 清除之前的定时器
    if (this.expandTimeout) {
      clearTimeout(this.expandTimeout)
    }

    let currentIndex = 0
    const expandNext = () => {
      if (currentIndex >= this.sections.length) return

      const section = this.sections[currentIndex]
      const $section = $commentBox.querySelector(`[data-section="${section}"]`) as HTMLElement
      
      if ($section) {
        // 显示部分
        $section.style.display = ''
        $section.classList.add('atk-expanding')
        
        // 触发重排以确保动画效果
        void $section.offsetHeight
        
        // 移除 expanding 类以触发 CSS 动画
        setTimeout(() => {
          $section.classList.remove('atk-expanding')
        }, 50)
      }

      currentIndex++
      
      // 继续展开下一个部分
      if (currentIndex < this.sections.length) {
        this.expandTimeout = setTimeout(expandNext, this.expandDelay)
      }
    }

    // 开始展开
    expandNext()
  }

  public collapse() {
    this.setCollapsedState(true)
  }

  public isExpanded() {
    return !this.isCollapsed
  }
}