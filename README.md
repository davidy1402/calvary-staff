# Calvary Staff (加略山社区教会侍奉表与同工调度 Web App)

专为马来西亚新山加略山社区教会打造的现代化服侍排班与同工调度系统。针对教会真实服侍场景优化，支持多堂聚会、跨部门排班、iOS 原生手势交互与 WhatsApp 侍奉表即时分享。

## 技术栈与特性

- 核心架构: React 19 + TypeScript + Vite 8
- 样式系统: Tailwind CSS v4
- 图标体系: Lucide React
- 移动端工学: 原生 iOS 风格 BottomSheet 拖拽收起手势 (Pointer Events) 与丝滑动画，针对 iPhone 与 iPad 屏幕比例优化
- 数据存储: 纯客户端 LocalStorage 离线持久化与极速加载，零月租、零运维成本
- 沟通协作: 一键格式化生成适合 WhatsApp 群组与私聊的服侍提醒文本

## 本地开发与测试

```bash
# 安装依赖
npm install

# 启动本地开发服务 (支持局域网移动设备真机访问)
npm run dev

# 语法与代码检查
npm run lint

# 生产环境构建打包
npm run build
```

局域网移动设备测试:
启动 `npm run dev` 后，终端会输出 `Network: http://<局域网IP>:5173`。手机连接同一 Wi-Fi 即可直接访问并进行真机交互测试。

## 许可证

MIT License
