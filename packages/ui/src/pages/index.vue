<template>
  <div class="page-wrapper">
    <div class="messenger-container">
      <messenger />
    </div>
    <div class="container">
      <how-it-works />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.messenger-container {
  margin: 2rem auto 0;
  width: 90vw;
}

.page-wrapper {
  position: relative;
  padding-top: 40px;

  &:before {
    position: absolute;
    background: $primary;
    height: 275px;
    width: 100%;
    top: 0;
    left: 0;
    content: "";
    z-index: -1;

    @media (max-width: $breakpoint-xs) {
      height: 540px;
    }
  }

  @media (max-width: $breakpoint-sm) {
    padding-top: 1px;
  }
}
</style>
