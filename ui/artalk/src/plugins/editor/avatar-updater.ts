import EditorPlugin from './_plug'
import type PlugKit from './_kit'
import { getEmailHash } from '@/lib/hash'
import * as Utils from '@/lib/utils'

export default class AvatarUpdater extends EditorPlugin {
  private $avatarImg: HTMLImageElement | null = null
  private defaultAvatarSrc = 'https://cn.cravatar.com/avatar/5573cb7cf794d7bcdd451234e4913566770381462e24cb478e35c3bcea30cb13?sha256=1&d=mp&s=50'

  constructor(kit: PlugKit) {
    super(kit)

    const onEmailInput = ({ field, $input }: { field: string; $input: HTMLInputElement }) => {
      if (field === 'email') {
        this.updateAvatar($input.value)
      }
    }

    this.kit.useMounted(() => {
      // 获取头像图片元素
      this.$avatarImg = this.kit.useEditor().getEl().querySelector<HTMLImageElement>('.atk-comment-avatar-image')
      
      // 监听邮箱输入事件
      this.kit.useEvents().on('header-input', onEmailInput)
      
      // 初始化时检查邮箱输入框是否已有值
      this.initializeAvatar()
    })

    this.kit.useUnmounted(() => {
      this.kit.useEvents().off('header-input', onEmailInput)
    })
  }

  private initializeAvatar() {
    // 获取邮箱输入框的当前值
    const $emailInput = this.kit.useUI().$email
    if ($emailInput && $emailInput.value.trim()) {
      // 如果邮箱输入框有值，立即更新头像
      this.updateAvatar($emailInput.value.trim())
    }
  }

  private async updateAvatar(email: string) {
    if (!this.$avatarImg) return

    // 如果邮箱为空，使用默认头像
    if (!email || !email.trim()) {
      this.$avatarImg.src = this.defaultAvatarSrc
      return
    }

    try {
      // 获取Gravatar配置
      const gravatarConf = this.kit.useConf().gravatar || {
        mirror: 'https://cn.cravatar.com/avatar',
        params: 'sha256=1&d=mp&s=50'
      }

      // 检查参数中是否包含sha256
      const useSHA256 = gravatarConf.params.includes('sha256=1')
      const algorithm = useSHA256 ? 'sha256' : 'md5'

      // 计算邮箱哈希
      const emailHash = await getEmailHash(email, algorithm)

      // 生成头像URL
      const avatarURL = Utils.getGravatarURL({
        mirror: gravatarConf.mirror,
        params: gravatarConf.params,
        emailHash: emailHash
      })

      // 更新头像
      this.$avatarImg.src = avatarURL

      // 添加错误处理，如果头像加载失败则使用默认头像
      this.$avatarImg.onerror = () => {
        if (this.$avatarImg) {
          this.$avatarImg.src = this.defaultAvatarSrc
        }
      }

    } catch (error) {
      console.warn('Failed to update avatar:', error)
      this.$avatarImg.src = this.defaultAvatarSrc
    }
  }
}