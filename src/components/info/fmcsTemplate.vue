<template>
  <div>
    <iframe
      title="grafanaTemplate"
      class="embed-responsive-item grafanaTemplate"
      :src="url"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: "fmcs-template",
  props: {
    url: String,
  },

  data() {
    return {};
  },
  created() {},
  mounted() {},

  methods: {},
};
</script>
<style lang = "scss" scoped>
.grafanaTemplate{
  height: 100vh;
  width: 100%;
  border-width: 0;
}
</style>