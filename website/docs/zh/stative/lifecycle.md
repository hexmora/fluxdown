# 生命周期

一段状态流应该和使用它的功能一起开始、一起结束。Stative 会清理闭包管理的子计算；外部资源也可以接入同一个生命周期。

## 谁创建，谁清理

用 `render` 创建的根闭包，由调用方负责销毁。通过嵌套描述、`useCreate`、`useMap` 等方式创建并交给闭包管理的子计算，会一起清理。

```ts
import { MutableState, render, S } from 'stative';

type LengthInputs = {
  text: string;
};

const Length = ({ text }: LengthInputs) => text.length;

const text = MutableState.of('你好');
const length = render(S([Length, { text }]));
const subscription = length.value.subscribe((value) => console.log(value));

// 使用结束时
subscription.unsubscribe();
length.destroy();
text.destroy();
```

停止订阅和销毁闭包是两件事。`unsubscribe()` 停止接收通知；`destroy()` 结束闭包的生命周期，释放内部依赖。

传入的外部状态（这里的 `text`）不会因为根闭包销毁而一起销毁。它可能被其他功能共享，应由创建它的代码在合适的时机清理。

## 管理定时器和事件来源

`ReactiveState` 可以把外部事件转为具有当前值的状态。提供 `initial` 作为初始值，在 `emitter` 中推送更新，并返回清理函数：

```ts
import { once, ReactiveState, render, S, useClearable } from 'stative';

const Clock = once(() =>
  useClearable(
    new ReactiveState({
      initial: Date.now(),
      emitter: (observer) => {
        const timer = setInterval(() => observer.next(Date.now()), 1000);

        return () => clearInterval(timer);
      },
    }),
  ),
);

const clock = render(S([Clock, {}]));
const subscription = clock.value.subscribe((time) => console.log(time));

// 页面离开或功能结束时执行
subscription.unsubscribe();
clock.destroy();
```

`useClearable` 把这个状态注册为闭包的资源。销毁 `clock` 时，状态会被销毁，`emitter` 返回的清理函数会停止定时器。

默认情况下，`emitter` 在状态首次被访问或订阅时启动。取消某一次订阅不会自动销毁这个状态；用所属闭包的 `destroy()` 结束它。

接入事件监听或其他数据源时，也可以沿用这个模式：建立连接、调用 `observer.next(value)` 更新、返回断开连接的函数。

## 注册其他清理操作

在 `once` 中，也可以直接把清理函数交给 `useClearable`：

```ts
import { D, once, useClearable } from 'stative';

const Session = once(() => {
  const controller = new AbortController();

  useClearable(() => controller.abort());

  return D(controller.signal);
});
```

闭包销毁时会执行这个函数。`useClearable` 也接受可取消的订阅和带有 `destroy()` 的对象。类中使用对应的 `this.clearable(...)`。

## 完成与错误

外部数据源可以调用 `observer.complete()` 表示结束，或调用 `observer.error(error)` 传递错误。订阅时可以分别处理它们：

```ts
import { MutableState } from 'stative';

const state = MutableState.of('准备中');
const subscription = state.subscribe({
  next: (value) => console.log(value),
  error: (error) => console.error('状态更新失败', error),
  complete: () => console.log('状态流已结束'),
});

state.next('已完成');
state.complete();
subscription.unsubscribe();
```

`MutableState` 提供对应的 `complete()` 和 `error()` 方法。完成或出错后的状态不再接受更新；如果业务需要重试，通常将加载结果和错误作为普通状态值表示，再由业务逻辑决定下一步。
