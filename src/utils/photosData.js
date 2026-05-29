// Dynamic Photo & Video Geo-location Mapping Engine
const LOCATION_RULES = [
  { start: "26/04/2026", end: "28/04/2026", location: "Kon Tum" },
  { start: "24/05/2026", end: "27/05/2026", location: "Đà Nẵng" },
  // Add other trips here as you provide them!
  // Example: { start: "27/02/2026", end: "02/03/2026", location: "Đà Lạt" }
];

const parseDate = (dateStr) => {
  if (!dateStr || dateStr === "Không rõ") return null;
  const parts = dateStr.split(" ")[0].split("/");
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

const RAW_MEDIA = [
  {
    "id": "AF1QipNoB7SnA-7Xe2lSFaQM6HyVLb8Klxcrrgy4yuTF",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPOT10BHBF1JRZfmkLVhCgkTk36BbE0Gf3LKX9akNwnG-BuJYkIj51mzAOJ2Gl-hvp6CGtgxMmylAt55O6miBOxRoaFiULWhzDFZ_a77S-OIBoMD9mm",
    "location": null,
    "date": "26/05/2026 00:47",
    "isVideo": true
  },
  {
    "id": "AF1QipPYGziToDD6aqOSb5r_OFVlZ5HmICRKwxdeq0Ss",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPqB0weC2dcQC_gNV3LKx0-LOJl4Soaxsp7RpFw7EYk5GzC0zuNRaSHGhB7uaAhZPaB0fi379HWg6PpojpK4Q4cf6eQEWjetO2YJE_lpiTuqqziTGAq",
    "location": null,
    "date": "25/05/2026 18:59",
    "isVideo": true
  },
  {
    "id": "AF1QipMSGEolv6qLzqntDq2YOYZFvD1s6TWN8oMcXm3M",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP29UXfENu9RgFalJQ4nggUGeqVSHb0wi4cP8u7UUc7Cd8hRtS1cDLOeyY30uq3XPliC3K1HrV3wcwdxKxPAGiz9ZqpzCbe-Tu-cnRbA0zomNuRmZiX",
    "location": null,
    "date": "16/05/2026 22:37",
    "isVideo": true
  },
  {
    "id": "AF1QipPPmJwHiGn9use1FgGmtNk4_2bke5jf7Ma7qp3A",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNtUI7PKzy-O6y5LCe-mtUxSoTvuN10HT0VyNHl5q_uFgHo-6DqZaPOo7Y_TCIGlCSmF8kVW5QDI0rT4CaeIykOlJAe8NRiuXEaBF_LpbOFFtrzpqaS",
    "location": null,
    "date": "16/05/2026 22:37",
    "isVideo": false
  },
  {
    "id": "AF1QipOPapIgws8HDC4k20-Szd27VMS15fflGvBP987x",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN7to1r-AAXFxQjS-VGIgo00ti5XfIrnGwydSbWiw42gJlpBbbm3iJgHBg8V5LFmoxLjv6PbpNz1FTvftuuClRfQYz2CGXlDSx3DdTS0tQXN8wp0BJd",
    "location": null,
    "date": "16/05/2026 22:37",
    "isVideo": true
  },
  {
    "id": "AF1QipM8QqwEX5ySqGOGowRTvXm_hPfsG3KrQqWQFYi_",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOIM7DW7oPdUJugrzhVXY0F58EzwM4_tOC1AGF-DUxMZFHT1NILmDYNXJfbmwVLsZ-PILJhoS4OQhGEghrvDhEKSaHggSEhbm4CU5JB8sMLAbN38Uo0",
    "location": null,
    "date": "15/05/2026 19:53",
    "isVideo": true
  },
  {
    "id": "AF1QipM9SuvQv46vcP7kU2teUC6KGYZceswmkb0te5Hq",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPJx_w-ROO7t6Yq9944PzGVE_EpdgrBfKM-4u12GQZfzAUykHZkKTZYPo-5COcYE5x0p-mhRuukoIVF3HwjfQXy3a2KxZi0C0a5e-1R1zNdLjVL1yrV",
    "location": null,
    "date": "15/05/2026 19:53",
    "isVideo": true
  },
  {
    "id": "AF1QipOkzbtsXG_6SG1euHXSuXLobQwOXtc2rRh8zr8C",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP-B1s5r0ABXf7XrLunE3GF1plwZDuxp635jKz4r2gxZ8lBbhWuHzTpJghDcjHalY9XTX8ybARfj2H2wfujSSvyAv2vqJBhCXRkz7iApnL-UtS1CEUW",
    "location": null,
    "date": "03/05/2026 21:04",
    "isVideo": false
  },
  {
    "id": "AF1QipNM4RwQti2zFh9VFNQjyk7hQ-2jQI1jSdohXvss",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO9QcqlMxnto9y5Wlk8Z8IxXF2-lRDB-4C3l9aKnaSZIfjgYXJUAaiC8sBAOAogpBDfLL5bCwXBorRCL8Cb3LtoQNGoB9vltiKzUSqyArCU9GJVIHR8",
    "location": null,
    "date": "28/04/2026 20:58",
    "isVideo": true
  },
  {
    "id": "AF1QipOB7jL6vvLqhfoaexKEZQ72M2X-J_iAdOAtAceE",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMcTE1ZH1pzwbt0vd9lpEPuoxEdwXCLU0hmzBmUH6XMPmHSKPNnJI5k3OqYsETZ4JGwfvPN_g_Ex4S70S6O0vpXBJQMxn1qstpnhR1vaUg0Nzc3C06S",
    "location": null,
    "date": "28/04/2026 20:57",
    "isVideo": true
  },
  {
    "id": "AF1QipOzQTTUnEtkYsnNwQVYgoYmFy8vfySClVY7WcpX",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMGEOHHrcJbRva53ZLv7qsVxB2kPGaV_JXnrSnrBDfl-u_tTl-ZiUjV3GqbFW36wZFdTjzCHB-khltSnXgFSK_j9uU3pkuC4uUOv8bXVz7qaG1Crx5W",
    "location": null,
    "date": "28/04/2026 20:57",
    "isVideo": false
  },
  {
    "id": "AF1QipNioD-UWi2HPKqqRJpeDK8K1hzEdxkfj3FeL_dx",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMyFDmpbwXAVkAqWk6v7c06wyomIl2pKgRlrhqvmi2wImG8vyIiIRmpKzYBNks-tVkqNsPwikeU8JM23wOWLn9DdGobaatIC5nMCaWrwvr8ys_cfhYk",
    "location": null,
    "date": "28/04/2026 20:57",
    "isVideo": false
  },
  {
    "id": "AF1QipO6wRyZOMCiftJ1sM3P0oPL2Cv8cV_N7_l9Up8Q",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOO6QTRY9YI-OR-rvDEawc6Fm_e-OQZWIM8F3MleM9LZsW5Av0iwhBO6WlQ57JLVQxthGQK_08yz1feDp8ZmewNZZkcWtj_7q3vWFW78HhHMyOdfTEc",
    "location": null,
    "date": "28/04/2026 20:31",
    "isVideo": false
  },
  {
    "id": "AF1QipPAKXfgn94lxYAbAjctK2D7_Dd7yLDGKnbiUCzd",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOcL805b42--TpbZBz2BIxVtPZQLUtcSD5aAv7eUbfb7FuFpom1ajTEnrTowHfmFch2_-BDH_AZg5EfzSClY60Xklty9q3OBCNXsgV7DCojZpIKWiiu",
    "location": null,
    "date": "27/04/2026 18:10",
    "isVideo": true
  },
  {
    "id": "AF1QipPDhdrhmt3oswoOdajMeIWAfgQ6rdFECQY_0RiP",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM11Yjp2jgq7BJQRmXYIOlq5sxgkOR77Iok4zOJ-OcidPksQl3yrcvU6w4xmwaEd9mQNPw-N9a5jq1O9pHw_grF4B3EAj_suYD4APGNx7sgm1PFNY2n",
    "location": null,
    "date": "27/04/2026 18:10",
    "isVideo": true
  },
  {
    "id": "AF1QipPt4VBZj_WHrEVqhQnpW5vPhiap995coLE5USVb",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO9hL-N59_P6uwLXqTh_BjC4E53l0remNuXwxTXTSden89_I17IiaN8ZpvPkBoDHo2BvEhTaukoosuvg5sRxhUJh2mZjvumnm7tGb6ElUbtJkqJUo-E",
    "location": null,
    "date": "27/04/2026 17:53",
    "isVideo": true
  },
  {
    "id": "AF1QipPbVLTbMIyx9i2-KzVKzP5Zxeqst7mg4UYy0y-1",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNo8-so9acwvfMhLOZ91SUw2BS_1rLvSD97dlQimcaCTaGyppkP1qDgyweFQFuCjkFWXKZ9dZLwUnrr0GTSPLKsPiOGqzzkVAGYrWABY0iVkPDTRA5L",
    "location": null,
    "date": "27/04/2026 14:45",
    "isVideo": true
  },
  {
    "id": "AF1QipPPsOD0ye7Rb-nSb54v_K5bHKienmmetRaGGE-M",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMZ4eVxXCWV7dP9Qmd0r78uS9SniZWE5Sey73LjtpA7VBzs479hTYSIQNjX98Q63kauViZrf70EOSCIDRT4EV0sFBTNhMX9FoHlkbBwhtaEX1oMDfUq",
    "location": null,
    "date": "27/04/2026 14:44",
    "isVideo": true
  },
  {
    "id": "AF1QipNZbnRT2YnkmORdCZuOjedKzveBuuVOEh76WoBA",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPRNmtiSLgxb_6bwRR24Xzs0OLRbWy4LsPXJyVJ1GJm8LNC_i_emXqkENLxy1vJEOeeWFtn4FyVBcRrjKwN5VFYdBCPM1Utc245MFcjecai5bz7gcB5",
    "location": null,
    "date": "27/04/2026 10:43",
    "isVideo": true
  },
  {
    "id": "AF1QipMImvEJKk6t4CIwVMvIMTonXZhV3K-tEkmPle-Z",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNOUerM9hkU1ILBpEP5PiIT7z97NK1ai1WYialFnL4apvXn4XEqtkNytjDZbbXrV-Y2dp1useOp7INxDHrt_wXLXsKC39RuOXHPgBDfAgS1dVKBuLHc",
    "location": null,
    "date": "27/04/2026 10:42",
    "isVideo": true
  },
  {
    "id": "AF1QipMtaGQmF8dgVhZ9TXE1D3dF46EXeSpWCJmSLPq6",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP2mScEN-nT8BXOp-Jb8RrMedEdGMHS0LH2nJYtw1JrJoz-dOi3ym6vKIT-Mlz1t8b9rkj4R77gplnJIba0My2Zrs-J83-M0W0Je4jR59aZR_bVBPTG",
    "location": null,
    "date": "27/04/2026 08:10",
    "isVideo": false
  },
  {
    "id": "AF1QipMkV3vVcssaeWbicNtMRyeo3p_UrFCJZFWv8OTt",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOUhO8q98hzUdWI7OaJEYX-OvDwwrDEfISEkLpkR7usXKyQzxSTYVGzdOcQSAdZsxAIfCh0cFzsIpzwTjv4YzcxZYnHFF9sCQp3EQG9aBHP9hfd24Kj",
    "location": null,
    "date": "27/04/2026 08:09",
    "isVideo": false
  },
  {
    "id": "AF1QipOeGKKpLPm4i4lqZhf5Q-wHMGoXHlz4FQM-b0YY",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNMRASQgWQNaYWmyGOBJ7_CwiQjRaRv9aes5xwnKZm_Cv5apV1JhnY43AsjqAfUlU9vIbAacJM6FQ0QvSKfaRUOWuQbCaU1e88CnIAKJTEGylpaGxub",
    "location": null,
    "date": "27/04/2026 02:23",
    "isVideo": false
  },
  {
    "id": "AF1QipNx150YwsrsYQ7_xg5DTgi6HlfsAbW6rctoO6HL",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOoa-0va8NANqFtGfJ6oEfcJkgfP0oBmxZqoHtNJ11wncJith70JNT3Xpn5YYelXsZZRgSd1BgVgQ_fi108CM5t_02Tlc4uysFXHc29aykzQ6OdWdCB",
    "location": null,
    "date": "27/04/2026 02:15",
    "isVideo": false
  },
  {
    "id": "AF1QipNqxTNkt1jkAAie6xWqQSNUuoMEMcoA8vX6pOA-",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM7xZQAOGMAYSxAW4WTM5hUowu6YcGlFxx70awlc2g7Dj_bI5aZomeV76TzMXQlTpFPvnbNPZCPoCX81hYkFoNEYyomYDn5UwabBBlOVeqBwKoN_88j",
    "location": null,
    "date": "27/04/2026 01:45",
    "isVideo": true
  },
  {
    "id": "AF1QipPORJu4PJ8GB9wXN8rSVFaDCVPrnIlwmvM5WRnZ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO8jMs-CsZAthTlFu2T2-36y_CgrjNkCU5RfCxXH5P2iuOZ45iuc-xzx1Ds1lvDf3DO18Ji9SV_SQfr-IjNJueUHjknuUxTfcwHI3_h8in4usSS1Ql_",
    "location": null,
    "date": "26/04/2026 13:50",
    "isVideo": false
  },
  {
    "id": "AF1QipOj0Y0269tN48zemtwDlo5adNS71O81boNqoVXj",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN7PASVLapwhNxg1Xt6hf_bvtq6Xp5AGs0uKDmCMBFa2p56vLzRj_22axu8kx3kmz97PdWOtyA19WLAQO9E1Cm-t5ZplRE75Re4E4iCWDkd5Rb40X4w",
    "location": null,
    "date": "26/04/2026 13:50",
    "isVideo": false
  },
  {
    "id": "AF1QipMxKH6AGmt74pcdnZMNEGeC9PIoP53HyTYzwr2j",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPAYO8sewGsQKpA37-7oS_SQljALDyO750Z9g6PDBO_3c0sLryJixzw2RiugP6ZtvX1lgmmqoJM5F04qfm8bT2pGFqBr5b-hDjkZyz9N_BMqv-WeAHK",
    "location": null,
    "date": "26/04/2026 13:50",
    "isVideo": true
  },
  {
    "id": "AF1QipMb9jIQHChA0DKrhsozIn3NHbBXbNpo5qFKPrK1",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOdLNlvD4ce8OOtJbus8Axvc0_0gmBwnO5cxt9_5_GfQs5SlzAESAJ7KOmCOqLOryyVAox38b-g0VTI-OEwxgMqxrFNrLSoZGPcW2QYROPPuGuJeeTi",
    "location": null,
    "date": "26/04/2026 13:36",
    "isVideo": false
  },
  {
    "id": "AF1QipMZRCgvdjQdn3WDXHCkJNPkifoqVPtZqF0i69pz",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMsynhm73crkGRlVnyDDqWfiGtbIEJC5o4auEj3ExLNf4bhivhPIfkPWRgiCOyUEb_N0IfhcfkDSqTtf6_et-SJzzHtsPmfQMAOCV5OgDGaA1aXhHTb",
    "location": null,
    "date": "26/04/2026 13:36",
    "isVideo": false
  },
  {
    "id": "AF1QipNjpuWsvDAc5BX9KqG-l_-PbfdpbDwNXpG0qnTZ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPJPrMU2eO6RGEYCdRM6Favf_t5d50puSQwJcCvETaaPjsQtFFHWhSt2G69oXmg73ZBdrBb1-sBahj95CS7fa3YQBKQ8UYsrk8jEylLObSZZV45jefs",
    "location": null,
    "date": "26/04/2026 10:42",
    "isVideo": true
  },
  {
    "id": "AF1QipMO5AZJCMpsTYswzqoM34pSBBxuSVurKewhcko5",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMBvNiss9HJZzH_HGdv_mkAg2h5RtOQhqbbK_sd6XxeZlsnV5GpsRdTHjFOgit8Bw4NuWboggVPNlhGUMI95ACP1_iR1rQJdOJaLI_Htqw8IE1GS5Rm",
    "location": null,
    "date": "26/04/2026 10:41",
    "isVideo": true
  },
  {
    "id": "AF1QipNcxioZjGzfh-EKq1Bw6mIZ2c01sAWozZ3dAtHG",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPlT00vKbMwjw1G6ITOc7k0-jaz59tRJgFxNVPQw1ukGxIcsHPOJGMPzz9u7xcghElDf7ZBHa6nHtzKa7iXa443sMd18WL2wgdeQT2C81u03cG0CV0V",
    "location": null,
    "date": "26/04/2026 10:41",
    "isVideo": true
  },
  {
    "id": "AF1QipMgdCYiJiJkPv9RIkanxfCruRQ8SIpOx0C3oLnn",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN-Rg9ETnFqhFt0HtmirMgMA-5HvuJ7hX3akm0wILnTcTcUYBKvbj_VABl5aQ5Apkfox8qC2CiWb7tS1NlHjXmheuM1-bKB3ADRgh0HxaZfYM8nIV-g",
    "location": null,
    "date": "26/04/2026 10:39",
    "isVideo": true
  },
  {
    "id": "AF1QipMvT_fM2PxR-Xv9jtHffSkVaJMtIiOghVxYLIry",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOtbL8KvisC1PLGoUNMn3XpA_EoIcz1_vd0oKmGNBmdAJyvv883tWJNk3Z4ke5tVh9Bhx8-Ny0Fukwnsqj22x_9JSrEa2ueVbxJOmL3ShSoiM_ecoof",
    "location": null,
    "date": "26/04/2026 08:44",
    "isVideo": true
  },
  {
    "id": "AF1QipMrlCq2IzS_yqzdDOCCybW2ZQOeJiRnQE2KoAB8",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPa4CBJsK87OLq0d1Q-Nme3GyusmdRcQSh_R40ceYbIHMmVoR5eAn6Lukb1lLBrNQjQcfMH73LhSx5NoKcT3BouqR4RqFb-kVmsQYtN7KyXYrozNwxt",
    "location": null,
    "date": "26/04/2026 08:41",
    "isVideo": true
  },
  {
    "id": "AF1QipNNIY2TNlocg6yrxSfFvB20cBf_rSA1dWcX-Ydv",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO2ZRKa8DU739RtYLMljNtSUXxEi7C_SJqynEJh3130mLev4pNhw266vlzOFBPuwC5hP6ZHovLvNevI48SmGVgXHQEn3hnKRU7ZyfaDEqc48-8SVl2h",
    "location": null,
    "date": "26/04/2026 08:38",
    "isVideo": true
  },
  {
    "id": "AF1QipO6Sgz5Nxt5xGa1g1mU6FnAdL3BIXP1xoRbdANk",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOm5Lf4s1Sg8ek01I4MSn2s87iFY69KQ2wlTR8mYWx2T6Cr6SS7OXgghAz8nDsJJE8hUhx39ZHr3rH0UfpN6Zn-cIYdUepDSEikrZSwFrj1TY8kiOUE",
    "location": null,
    "date": "26/04/2026 08:35",
    "isVideo": true
  },
  {
    "id": "AF1QipPA8qfOsgehxaiy73V3Li6KnJJM2dc5p0DP-Ms0",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO1bwxHjTgFYfmGltncAGIrHLt5oERbDx8TZBc3V8qUGy-ywdpFK4q0Wm_K16DF1YEJ-jg6JQNpQV2GiR_jvlfQsPWSjtVCJ1OL9dW3sK8xlXt2Piq8",
    "location": null,
    "date": "26/04/2026 08:26",
    "isVideo": true
  },
  {
    "id": "AF1QipMOxBwk7pd4NcEq0CGQ33LxCUEazJevrodeEhfY",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOO2g5UR6A0yvJh-9sUwM355nW59JtrG7Vt7lyDUOkxf7MziCZY2X3G16g_qxc84MuBepXgr5LZpJiO5BTboKabdeI89-84-Z0nq02362utJNjjp3Qf",
    "location": null,
    "date": "26/04/2026 08:25",
    "isVideo": false
  },
  {
    "id": "AF1QipMkJWiphUQz9v2RGgrdVooV4cjvmlTjm77qh_Lc",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPvfxHtmol-AcGCqwaQ0Pg_LYPYKBqSkFZtPmD1Ak-wl5H2cFmojXyjlg07pQ_rEqDxyX-Mf9EQzhgKZJMJFDuMdNPzRDp_p_g1bSPDO_cMCDv6n-cY",
    "location": null,
    "date": "26/04/2026 07:38",
    "isVideo": true
  },
  {
    "id": "AF1QipNUUF-giOkElemjriVCG-OxUkiggeq0l1Bo-mHC",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOer1LDgowzQqNay0AKURwo8hTRFa4wO2tj16Ux8oeC6V-0JywnrlUcXO3kN0Y261si69zKidEHobHj-hRBxSvXB_VvI5rSjyUBrk8kuMQf_CB3iFZ1",
    "location": null,
    "date": "26/04/2026 07:35",
    "isVideo": true
  },
  {
    "id": "AF1QipNNMEpAiCz-AZwCDZrOILhEuYipY2UsuwpKH8B6",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNwwF1HjnsuqFbN6Tm92mqhLonDhX1UwWnrCirSt09xG_8zSTJAxirYN_jtPHu2MjwnyZox_mev3P_VclUX2hENs5vw-I6ig5MpPB6JKM8yOgg4Pz1V",
    "location": null,
    "date": "26/04/2026 07:34",
    "isVideo": true
  },
  {
    "id": "AF1QipORQ2B4e4tRImfW6IV_7_bdj4LtMWhnVZ4Zdiro",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPOfs4aUU44bS_VC0Ed9hoIBpkwgnwCIaiLkrtq8puOdaF74Xsxhp2Ns5DXxSY0U5SKLfqLVmVAPxtdESNuprzvd7YtCbMF0B1Mf78Tx5m8WnACrKXt",
    "location": null,
    "date": "26/04/2026 07:33",
    "isVideo": true
  },
  {
    "id": "AF1QipP1mfft8k2oqWFzDgaDweg1dm46-X83Cf2CthYD",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO2tIJzs7cLJR1VWcNsR8zgvDGgtLoqJ6WWDMEKNIM8rG0kEzaN7vRKn-0RK3srNkBJSm-59QdYYHpIcLar4k_SJ5AQwJpHKCOUhMBz3YpSkiTlJxkw",
    "location": null,
    "date": "26/04/2026 07:28",
    "isVideo": true
  },
  {
    "id": "AF1QipMyjxy2mTfCby7FZDXpUIiwFqEyxeX5cADD3LH4",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPy8ssUR591QU_RvgLwKX6zm9we3VZbidAJji2FDKJPx0ngGPuBxShikMFooclHCesAyc2eRjcZcpXLupFXpoZcw9Bv-ZqY5lloCvNXxqGz_ZPBUDTM",
    "location": null,
    "date": "26/04/2026 07:00",
    "isVideo": true
  },
  {
    "id": "AF1QipOINinaeT8J3ogboJwJ16LIZkTeAxYbXyXDMFBm",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNqkRNcnnpMZecQ42Yxm_dkOPBddPAOM4jvoMShDrAieRV1MGM3r8TLmIA4HmOeSvgLM5_hx_MQTDMmGCo6oPDPGVF32OrS4OwLMopf8JN5vsOu71Um",
    "location": null,
    "date": "26/04/2026 06:59",
    "isVideo": true
  },
  {
    "id": "AF1QipOaRc-XvI-gYJwneEVucaalHnxjhvBqR8Nog-Ka",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPmcZuBioBCguCo3jqw6FJxsEvAvhGA22VL8U04vfrdExEngvnhaNUFSN-nqF8jTDVjHuwFn08ZDTwfe-RPXp3fJenE5WG8c87HZXAFiVuV1lISb2C9",
    "location": null,
    "date": "26/04/2026 06:57",
    "isVideo": true
  },
  {
    "id": "AF1QipMcQ4yD91ZU8RB2jPnj0M8DtuC5zKAZSqeWnu8l",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczObBND_G8ha_Mz8dO50a1u8QtUyEfwUS91ShLTeO8NhPmWaL3pbK_I37pHvbNImVGYaxcgWmdS6QWPPYgdysL5t7CQLSmXEOgqHRR3P_8bIDC6IydaK",
    "location": null,
    "date": "26/04/2026 06:57",
    "isVideo": true
  },
  {
    "id": "AF1QipMTLxMK89MeYl_7uS8kmAl51oa0p54MTcteBMDC",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMQQmc6xDgfT-a2mMaNEKncnNtxPXatvK1ciZAfkkuGDPHfyeFEjYk1fpC7A54WebS31PKLE05oayiNQG9dJ_0kJS4xrk-1-C9Pc_GvqGbLQOAxu-PG",
    "location": null,
    "date": "26/04/2026 06:56",
    "isVideo": true
  },
  {
    "id": "AF1QipPC7nt1OSu7aZWI4H3Pen0yChMnUWrJsAYckPto",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM25P32ilCDwO6RDatEmZlZgjvHjbhZNyA7nWO5VWLPjqKUoux2tIlWvMW_mDhdIUkIyvdh_iCParYECZdIzCKTWUEtSCSjRDkWQUFFM81WVpxRrs7T",
    "location": null,
    "date": "26/04/2026 06:55",
    "isVideo": true
  },
  {
    "id": "AF1QipMaxZpW9YZJM35Xm3R8RgfURftHo8Ewg74-ONMj",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMMsFM6qFmeVxGLCVFGYnescWKCwG5NVEm6GdJLh7sq-SQp27VT3xWdtZuQ6gtuOoVOuBuPUylSCLhAhCxDRQg25H3RsUPrNkJ3KANC-POytNQa_HcE",
    "location": null,
    "date": "26/04/2026 06:54",
    "isVideo": true
  },
  {
    "id": "AF1QipN7AIWrinQE2MORJUOMM-kjRc4O006Kb6W6Dgyy",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPIcsj7Es6mAF4ys6-UvI4w6cS-LUF-AetKbOL6bBD0qFW-a6WyfsN-CrnqJWYQy21KTh7O0GWvVOKT1Cs3wpG4ZasDqe53vqM_OtMX8vzdbLsWvccL",
    "location": null,
    "date": "26/04/2026 05:22",
    "isVideo": false
  },
  {
    "id": "AF1QipMY205rpcX2pnFgdOydkJ-JaFD2qIWl_O8u_jtA",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPVRRKc2OeqOEAAIMUzrxp6tIIWVTox85sSjVOMpWM3eEFGNpAJpb9GWqdqk8FWdEg89DvQaBBg8Z8MycMn2KoZObOlRA0iVyJyj3EKs2ZNAcPXn_JT",
    "location": null,
    "date": "26/04/2026 05:12",
    "isVideo": true
  },
  {
    "id": "AF1QipMZxuMJ6tL_x3v6KwHPEPUO7PEnSJGvDZ_KJ1PT",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOV-0ys0Tq3GgzoQPjLOxsELAc3tIYK9LaVjTc7PZKTwoLOFJw0nZwQDagDj0U6f9D-MxYgI8jkvb9AEQWrIqyIAP_BEdm7SHJ-dda12tNAUP_O1Soz",
    "location": null,
    "date": "26/04/2026 05:08",
    "isVideo": true
  },
  {
    "id": "AF1QipNmv-DOKsKSZDGhp3WSfTJviE6O6qSZc5tMcSEx",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNHHWmak-iTuT0T9txLVHY30zp3RFoD5ccCHYg5tyJFTv-cuAlJM-oAccXHDDis7S0MJLvOArKo5kL2hvCzkeB_Yk1PlfAyn4VonkVJnt_beqTc-JPj",
    "location": null,
    "date": "26/04/2026 05:07",
    "isVideo": true
  },
  {
    "id": "AF1QipOJsJR2vZKsED4FX3iPtlHjkiP1LZY1uXMxMs94",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOuCMyUA_CsIk9TmOGCgvb3pnsiv6fbBNWxEkwQvAYBh1frPU41JWGSit7ntwapLPFa6CbtgjntivAM5Bxxkz2-qh3E4NifOoOf6vmd-vAWr52xwzx6",
    "location": null,
    "date": "26/04/2026 04:51",
    "isVideo": true
  },
  {
    "id": "AF1QipMdM0YYUGWwEabbIXcTwzAvBXZFld2e6_VKTCxy",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNcaHrxY1YSa3FG3pJS-rPcn1y4ENkLr2h35kOooFHWGHY-pw7JQaKawYmKEF0egnxEJr_p4jhBv8iicKYk18CZkwxVssxAskWwnDetzHu1BnX4jsq1",
    "location": null,
    "date": "26/04/2026 04:50",
    "isVideo": false
  },
  {
    "id": "AF1QipOk87tXi9Wy2OGauxxvwFFt3rizGmyLE1-04MCR",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN1xaxmTRgMFR_nyNGYktHmfhpc8Ek90D5Y9dCSMMpAYsPZR982qK7OmecHX3AaYxBBJeheqCfjZ0nJc-W4fch8OZflKQKg8C-JLXVN5GVkXHyXgkd1",
    "location": null,
    "date": "26/04/2026 02:47",
    "isVideo": true
  },
  {
    "id": "AF1QipNMmL0zS9mHO7UQpXZGbzVvuMX0DmcXjhTGLqlX",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMm5u6tmWh2hvrVA25mK8ReXaQt3T7mXwq-xbCUy6M8H5dyGcDmHA5-1iMo40k-6cai0fD5RKRs1VrXoFwTuoBhWlntRy7W3yBL9VDv1uLPW9eJB90g",
    "location": null,
    "date": "26/04/2026 02:47",
    "isVideo": true
  },
  {
    "id": "AF1QipN7q4t1G8LFyWWgmn0KFXOWL-X4xyCML_AJZFI7",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNm_1bX2LU5ZVTP-FiRNzKsSfnROX2R_1DurlMcPo1Ie5xCfw_zO9YAT6U1PNwUXdNdkDEozh-dOqVdx8VlMl7kWMfXNmP_aDLQPJ_VHPC9Q6Cd1V0i",
    "location": null,
    "date": "26/04/2026 02:36",
    "isVideo": true
  },
  {
    "id": "AF1QipMsA6uxO822yz3c6WO_idsckH3dlyGBRi7RoMqn",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNPptvpmHnhk7z6rRpF4NQgie9kRq4Eyd406BvFaWrJTrQwiNg-a-Q0oNIH_RsMv7enUCzBR3HshDKz5-9-HUmeE8dJ-WIKIbZ5af0WAkcbCobOhINf",
    "location": null,
    "date": "26/04/2026 02:35",
    "isVideo": true
  },
  {
    "id": "AF1QipNaLCalrqJr7PzSdhis0xDqNZsIwM2ZfjVWGefT",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNqZrc-m7OPAl2BSzGGJddNo4rr4GWFJ8XbeKngvp3VB2vOiz-6LBHUolrR2VVnpePXU6Hq6PZ7aA_IS_1blhKlpAFpv704Jn236q5fAXgDkolZ11AX",
    "location": null,
    "date": "26/04/2026 02:25",
    "isVideo": true
  },
  {
    "id": "AF1QipPA_PvDT1VOmIY_ygXms-Fd1LjV3YTxfiqMD_tF",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPjXypZMyeI6_xVXbPEESLSCcTMzoKjgSzVFykZLn_tD2x34Gmod1WmL2V1d3g_xvUdG-9GFwwXwUJ5qYQQ9sIIrzXO9m3GLugLIct0-IR89Ixzm9LJ",
    "location": null,
    "date": "26/04/2026 02:22",
    "isVideo": true
  },
  {
    "id": "AF1QipNzCBKdkIg2aikNTn5qsRNzIFX3mNl6nzH2k5EW",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNmVWPF55UYM3GJtg83F3AtxIdO-3XQspAdQ7d0Z8QrdljeOykcpogsq0rUQWjIZJqYw05ntLgRPMTHI39n5Mz4Z4U_YujxBi5aAySURLH07iPQOoxI",
    "location": null,
    "date": "28/03/2026 19:57",
    "isVideo": false
  },
  {
    "id": "AF1QipOtbBEiXeDiizN6zfOy7LXV58xT__7Vd3FSqkSV",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNns5TxgjF21XJ2pZK6sZyaVWnyMqUMXz9uhUtQUTlag1we8sWcjCs38bs5dC0GDmVziDt9RjVNcw_EGHpKCHweic5ZTVEcW57g0uNiHN_fv3c8usow",
    "location": null,
    "date": "28/03/2026 19:22",
    "isVideo": false
  },
  {
    "id": "AF1QipPLeH9yul5Yal8kXDDVe0Fo5j4GE8GqZWJtZxjK",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPTa7Mjfqe66FjcGFWLE3jI9HPV184EUNb56vWr3FW0s1wA6a2SASyep7XJndFNmQoILaJbjn_BynkX9EEl03zHLbW_0tH-oIt9UOrpMfJl3WcQTCVe",
    "location": null,
    "date": "28/03/2026 19:22",
    "isVideo": false
  },
  {
    "id": "AF1QipMFe71umkCdNTLmlrDfMmP6Iye9SBaPg2NBx9_9",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMxBnikuH-Ouup-EiPSTUzo2DVI5NtZX_KmU1-e5THio8vQRA1OEQ_7AxcRYQUf5wRxzGNTB9XAPDW79nPYjDwc8qqc_Yrtog3c99KOwylhm2A3A0tR",
    "location": null,
    "date": "28/03/2026 19:22",
    "isVideo": false
  },
  {
    "id": "AF1QipOhL8DPyh5MP02BeQDAhUhdnWJaqg-LNC32I87u",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNZkp-D-5jL5MFksigQKhy0OxxJtHn8NKgJKZJz9Ya9tmctqOJxeHl1nrNBeGPv1nf7vAXlBlsYou-TZtkrxwV30Gi3aQmFMK2MO5AnjDMavM2owH0T",
    "location": null,
    "date": "28/03/2026 19:22",
    "isVideo": false
  },
  {
    "id": "AF1QipMUx0bSv_Hmo5nOkemmIvxrLGoNues5-Jcz3yTb",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOCB9eCohmHhobj7Z7vHZBg9kRlz6krf-gK6sgLi1lxLlRYE2QdB7nNblx9nPsQqjaIiS38J5zr9SfyAY6FvRAWQn_VJ1oHyWOsJjN64FYCaTt696OW",
    "location": null,
    "date": "28/03/2026 19:21",
    "isVideo": false
  },
  {
    "id": "AF1QipNngnuNWyhhhxMMIfKWd8fOKijQt06BA-2FhuPx",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO2IQIjp-3E3HomCwq-m98lsufvKAX-Kjqj34mwww9rdWIC51Zhttf2JRsnFzn9tNHSOeyUjUbiVwkZXWikDpLe7XaNcKZhO6vz82Iz_gmgX0JY1Ev0",
    "location": null,
    "date": "28/03/2026 19:12",
    "isVideo": false
  },
  {
    "id": "AF1QipMcSnH3cpVH_-P4Wp9ZypJlq9V4DuibDZOYCoCG",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMKcd4FaHouZ1fQeqVPH_X_9hao8xrBcUrQE_93_blsYHF6mWMQuDuGvQvROvSrBx57bxluBmSHbkDW1LgRfzMNXRmw8SncBG2gqcfCYf61KoGDo8vC",
    "location": null,
    "date": "20/03/2026 18:50",
    "isVideo": true
  },
  {
    "id": "AF1QipPtMt_ljnSwwm7dsKe3dTIzkDl-vCSw1Qc-CqOg",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPVFQii8JZRnREE_7-Jqijp-z1cXm0f6qpa3f7Zg4T4POCMprly-5u9iZrCFDOIFH_qz2QKoFc9i5F_GnxLSxjZ1w4V_yhhF_sql9l-AA_xvlsJrm_o",
    "location": null,
    "date": "02/03/2026 10:00",
    "isVideo": false
  },
  {
    "id": "AF1QipMg3iMyJipGh7mRkgCHgnCn4PBFsu_dq0JQncO7",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMUSngheAHH5XBMAgKo5rWOrj23boitw2Ym38kG_jmpvB1uoUrsH5CNkyrPXEdlEMA1GJitjH807QN1aBkKwYnpz_DTcRp7OqnhAt2R15bxeRi05Y8L",
    "location": null,
    "date": "02/03/2026 10:00",
    "isVideo": false
  },
  {
    "id": "AF1QipOONAY461nwFmL9dQ0u97gl-m7asVV7hq4anHKj",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPCSWDZ7BoNBe2pVVv6DMNmdeKQcTHwt8EeIhj5ALYpp4mPZAscjTxJPUPgW20DTdwJ-JMRNBGovzJ9CFxuDhSjqy-Z5K5lmL4S9BxenD1o466SOhTH",
    "location": null,
    "date": "02/03/2026 10:00",
    "isVideo": false
  },
  {
    "id": "AF1QipOBVI3uNqnqs_vriVUICC6cyUa2tGIEtryogt8a",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNUYs5MZXiUYHpf_nHzSNOKUiID40SllQNGIix5CbTnOY4MAVQ8NN5VIPK--I4De_DsoVFTO4aUObzyhJUC_PKt08FZZHXqXnH5r_r43yblMHxBETPL",
    "location": null,
    "date": "02/03/2026 10:00",
    "isVideo": false
  },
  {
    "id": "AF1QipOibAPD4TDMW4BGKItLcm5_nyIKTMKxL9ACNB9_",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO1TTihYv3rIyJAqqzkYKYvoTCJGEc83yXWQSh4EMgc6Yjr3IS_V9P4SyDi6DxP4ZwpLOVmpRtcN8tz7tcDBw0sffXReWaHA8LdPx6aDLJ047NYYNVe",
    "location": null,
    "date": "02/03/2026 10:00",
    "isVideo": false
  },
  {
    "id": "AF1QipNHiAA-ujpis-F655lb7GKXKSi90AQZJWtHI6dT",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOyjKYvDqzqYTYMr8QQlmPBUnsEGqca4wfgpJM0MAL356p4M3N15eixzOlmEuG-ptsLVzFLXk4cZMI7jr0PgMUghJz-HMDIHOBod-LQT6GpyJh7nYjs",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipMCtDAnUcoNR90t6JAb6u_1zKcm7VgSkytPX4hb",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPJGKe6XLj2QJdQrt_l3fmbF6gn8nwX-ril5a2ofu_fzB8s_Fg8qADr4IZJ6EpervcJnhJiLk9sJPk8jH489gJDRZTKvDp8FmUt3OxmB_duV2ShCzfG",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipPG_lfI3j9M9OGdqobhFxfbhxyxYf9NJywwtUhl",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM71wz7lw2XRlOvK3VAFlejum776v-ALxH87l9PDf-dzghcQrhqG0piBC7R9vfFFhNvc5c8Ouv5O1V8TgX9uoOdtrqDLciZgiveFekSkYAS0hcxrerr",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipOb6orsT82kU9q2BYPGw1zQT5vArNFExe1PmvCi",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPowgSazMKJgfseGberjaZ3_R99KyXCcOnNNZXsEwr1rRm0MgMbDQ84b_kmD2PVZBHcxGThXkT7bEfhKRpQR9umPpsWEN1XGHkZ7o0bUcCpTyBAYDGH",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipO990AYjg6kMv7lHr0xEj4Vpkx-h89Wk-PH5Ir5",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOKFBky2GOPibDL7c0EHz5WX2C54N1yrjVaxGGG9QsJ4ZmtuFRo3jsadOZ1Dq4XBNSBZ3r2SU63GXPXV4ZnLLi491QiSzTGYRRlT6ST_pzsjY1TYyTG",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipMkFPOKkOJ_8jIHiiFcQtLjiGu4LRbzQlqcgQxX",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPDAdkuvWhKmHdcWdexFgfGykJ9muyx0Owt6YvCtXl00jhj1z0SlmIn2d2lGdvXyS3p23owa_Qz7iloYzAfMx8s1AIs_MXqp4e9QttDritapcxcde0v",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipOwBZhazBucTPH1Dx8GI3Inu4y1XL2VOEyfvSGO",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPlto6WHj7nX7DFRgvS0Dyl6dOC03oJ-CFgH8IKL0100fAZJuc_yhOhE2jcTnsyTM7Cmf41hjy-E55Y8ZBcFIRp7zWAuQsYdDM09yPPimHKQEhkimcR",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipPxG7zLC2niocdblBsUh2EDbgHaY4ZWbRHTixes",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNDA6Y2FyWU84ghiEt4-wF9S73ZVIhPakxeIKay7V8DPOuYoQGB4-zULFppjt8tuQwySbt9G8TAgYkdyenvtxbT6V2mBw0pmgKUKxDjugf011onMix_",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipMa3LLYN73C4CxkbdqZKCMUlFN0jwerx7ovr0fO",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPNhM5M8RDxRo4tTUENRMb8ioBmVSIGD_NH8CkPAHeCmZOheSFtgb4ynZ5VANTBc88fkePZwlZoLF9s7QxAFN6E5pHIpXODT7NYCxJe_RCEz5zoQOB3",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipP49r64yr2GAVgn1-itEtjMozl5QtgnK9Vlzjar",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNp0m0yIOdWrU_gMn_AsbISaXGW80waR3wRRB4L4F5xs7V95uXYkNsyWCKHczcDg_n_2hyW6rdzB9NcY9TBr3IfpF4P4Ky3NL2fwH6Ytwob6lvwAE6y",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipOPrqOOwiFrvdzlilaDnKC171wb0g0mox6QGTiI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPCcjohdVLcvHsEw7fdthvyFZMZGqLHLXuidwJwHUF5YeOkVsBL-e-ncgsZnlQgiDp6u-gul06m6bQThdmZM8YDCUx1sCRLME87T99i7r5G3LFBJq_f",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipMU6S5NIkkBv-NDezXt3lKwGHCkST6tPIWPLbT2",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMWHF74bfx2uARVmCGbMGwtFMmM-3KU7pmnytNdYpL52IhVDvvCx5zyclyLDzJtGEbhxFhc7qXgK3A4aXs_XI-riqiuIq9my9i8fJgTOeBqcJV91mQP",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipP8LaK3Hvpoup3xZ_jl6X3uTVJItkii_OZSXllw",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPSzwj1g4huavWL3E-onrGZrGjqzqSdCI4HOCznAcXhV9EFXiFwIH75ZBEdf0ldH533NBF724AISTdLjoJWC5pmgqOC5xKV56dU5OAaR13wPF5qBbgo",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipOmfDafvdoWHHkQkdjhk0ACN7H1QA8cHdYddyji",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM45i09rdvbncKEk1XAzuI66yJR3PeA9fViOksXSZrkB4Yzme_UOF7pgyATMuEFxsDZHJfc-EKM5hAVPIyZhN3migS6cNdZS9ybD_HJ9rFpEsqxuzFU",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipMMA-cexGoacgYC7XWgCf3WNLXUYAiOBgJbXNYD",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMRm52weB-1K52TPgA3VsX0dz4jPnoxeMXTG5VqxBKTfw5Q_ILCOTyFfeDTYEMCXdnUTPZfFWffxKH4f1STwVCnXzUHlTaaN71MOwO1Yq5MesUyYktG",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipOtdx8yE9M0fouxt9SQvQHgH1QDyTArNcYoBlOZ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPSptY27BzqjbWeu2VVyRmAKyZkJ8JwAbwunhNrT7c7p1Lf4w_lwtMDTADyAbPYT1mOJ5ff60zd29SLDkUc8qOcwz_oI2e4hpXQAzlwNDGWaFEe3Ac-",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipMyRbK9M0g_Y8vvgjZVEhDwCQQZwXeq0l79zxlJ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPtNa-EPiTfNTnCRvpIGCu8ZMK089cpsorrJ8V9oHb2R5F7TOWFRhxSpWqlm4hiXQo_GDyoXLxRvuATVLTunSviGZaeZLfma1KMJ2Mc6wDmZuFh8S7G",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipP-vqkM3-uQ3mufzBy_ZxnlYTagKFII1XtD8b5l",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczONOpOr2zkCPNXgD5ii7qRhFJ-sbvhtQupNT5d75xHr4HDTaxtkSYKzkcSImcFho4-Uxjg4rIlrmAyHn3MZRbQ16CihR5-EOmvhOau_P2cbidm6ekkG",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipOVzLhtpCwqH5XBB-MyxBwseTVw3BKQtSJfq8gL",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczME9ehpDj-G3OwlPQxWvtLET5sJneDKhEw6n2ny_2VSLQxyYmPEFTvyt8dApTmVpTNcz3qDgnRk_idE5SKGxDiz3x8C8qH4FhVmfyeFI56CLU-pwQTm",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": true
  },
  {
    "id": "AF1QipMV0r690YCxI2OBWp99Fi5OYwPikotaBo4vpy98",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP0ITuedgW2ERS57KSS2rh87MajK7cw3f-SVKZoqxtAXjakSZIz6zau1d_o7CpYQvn6Txyj3Y8niSANddDkDNWva8YTvz3ECGHATYLu--beM7IY41ZP",
    "location": null,
    "date": "02/03/2026 09:59",
    "isVideo": false
  },
  {
    "id": "AF1QipNkBOQ48LgK67nrL5EagR_N_R81nQAe41qHuiqO",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNl7rs7gJ5ey2R54_pw-UbdqkiGu9bU1FSwJ3a7-6CRdAAdRallhTbRTxh6yFxHRrSgku3Z5QJzDJ4EGxgni0SO7AjC0cgpwgWoHMM2BkCeF6df9CXm",
    "location": null,
    "date": "02/03/2026 02:55",
    "isVideo": false
  },
  {
    "id": "AF1QipPZz2mfNVMDQctC7il_3g4gBuyH4o8ugdyLkuZD",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOMCq837YLWS4Bmspg9iOJ7ww2lQfN2PoLkeUwkqITHDHa0_qfQmQE3Ku3H0ac9-ynItnE1PE8fWnxpDL3gXPAXf7DThAVDSmSsJe45gqV_elgxLP25",
    "location": null,
    "date": "01/03/2026 11:54",
    "isVideo": true
  },
  {
    "id": "AF1QipPNXhUEI3OwmlW6LWWlTk3QRevo023w6jDJyff6",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNCtg0tujVIIBNjqNFHiJArCtjiE85vrRLnjIC4AGrIyAH19-SwoTZq3AMUme8ra71biLasXmEH9NTje5vcMW10EqCLSVYn9vvQW_z8iixu31b1Moek",
    "location": null,
    "date": "01/03/2026 11:17",
    "isVideo": true
  },
  {
    "id": "AF1QipM06271f0T_0I5lblGbdoFCTJUDDDjd5rRmxDj3",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN5c7yGwbNOdcF_4qtpIiFNgS-OUqBetWFyg4rMDAqsHEPI6Y23qjc0Ms_XrLRcdQ0dv3AVtgrVuwAqQBewj_eoYDiJfP-Q_6NyvWCNhZkjvwVdftk",
    "location": null,
    "date": "01/03/2026 00:48",
    "isVideo": true
  },
  {
    "id": "AF1QipOrr4QJwS4kIw9Og0jgjlVrypsg3K0hj04TuKxU",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNaMD4r1zbkBqjLE9qDZarNq2zAT_PoFM7pxfn0aZOcNImjIJN0D3CLPnWiZB0DMV5Ev5UeNwTsK8TZf6Z83o5CfArpnsxoVjJI1amK1rrSNfT-hDO4",
    "location": null,
    "date": "28/02/2026 22:36",
    "isVideo": false
  },
  {
    "id": "AF1QipPjXuqNcB1wg9XG-QiGp0uQiJRlGOxk33PKvaD0",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOozfPV1ejJglEujtWoYDsaYYb5RF2bJwRYXte2OJgVEBPEx_2tVOXzATTqrrNB0QOEoGXUS4GDngsc8-RzBbRm8eFzPY9ez1aBfBpQqNHGUfFCfeOG",
    "location": null,
    "date": "28/02/2026 22:16",
    "isVideo": true
  },
  {
    "id": "AF1QipNFqsgNIc3DrWXX8y4FqCzT9i2sZl0ymoY0lJ9F",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN9c9aXnWlzwcfmqDjWJbil35vDAhXzZ9CKyepQ2hGkExSUWbCQRpcGShj4yRKOmsgg_AhqgS8nPz5TeLF7FHKAdVF3eEnH40nTF1ehsgEiIfuf1C3G",
    "location": null,
    "date": "28/02/2026 22:14",
    "isVideo": false
  },
  {
    "id": "AF1QipNLNGnIOhW8uZzS0reyxuKhvBQL8ccV1tJOKEsw",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOnL3hhFiNhzY9oyvrn0SdQMqYhj1QHQnJNBgP0Q_NRgDXUtQEhMN_tP7lOvi8tEtE2n4o6_61zO_Ep2wjdgC3-LXt4WDva5rnjQ2ej3vvb-POma0fU",
    "location": null,
    "date": "28/02/2026 22:14",
    "isVideo": true
  },
  {
    "id": "AF1QipNovMYu5id-xzx2-wIYTFLyR1toQD3DiLdBzEvF",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPWTVQbhoeMARADRqVKSOvVeoDQdBFtJ28S9OIxg9zMIscrtKMo1_LRL6JpvPrBOiMysT8jnKxtR0SmvckzxbYw8SFVsh_kIILziCXMxayJcRKYAQ7e",
    "location": null,
    "date": "28/02/2026 22:14",
    "isVideo": true
  },
  {
    "id": "AF1QipM-a5bnKekTyAmssYrON3BUtOs-aGdS4eUqg-h1",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczObh4IrfVw5RDGY2F9pBcYuCG0xNaCxWpKUXne5G4wV8yZDPIJmC60KB6nRbFeCsmZLE9WZUW-f3bAqqJOHJ6GEhGw3fH0ge_GY4IcaExP_ThdIobjZ",
    "location": null,
    "date": "28/02/2026 22:14",
    "isVideo": false
  },
  {
    "id": "AF1QipNFNYnbs7Ju7969DH4mXHd4irY9uOI2y-PbLOZV",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPO8U1mbQj8RtyoMyR2bmAq_1-pqyhXa0aphcTwf6Myju908VW9bPTMBTYWKlnHstCV9EMXyTGmWHopZwctBEorc_so0_l3BPE6tekbZSe0yGo9jonn",
    "location": null,
    "date": "28/02/2026 19:38",
    "isVideo": false
  },
  {
    "id": "AF1QipMHqphsgOazJe88IeOdFgy_v-vpf1huigPoXlRR",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPYtW-WqtkRJxJCOD761cS9Qh_mol42VkqLZED-byNXpws3k_5-n__TZWzNksZkoDEOepXS0aV_GvFk3ZTJpAsOuthrYAvoSaWtF5pszyrsXTM6lLsc",
    "location": null,
    "date": "28/02/2026 19:32",
    "isVideo": true
  },
  {
    "id": "AF1QipMuDMAFOpm5fjIXdKDpfOjB5Wo69bfox2crsceX",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOjEakqP-bnFHx0Ttk-hhguoqHSFbe2Umm5Jyb2jhNd2tL-ggSeoNbRZgI1zTzXdP9neiJaIjkJDEtds9Fxfciq2HdrnDZcuo49mh43R_8Pd7yEsFKl",
    "location": null,
    "date": "28/02/2026 16:17",
    "isVideo": false
  },
  {
    "id": "AF1QipPJga3Vhny18-UEbM016-uWhaeZJl6moYnosjy_",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOl9PO7ABDp_XoEDXy-A0bpWNkZpmML3W89a8KzAphHsUAtbRT9iL3KGdayyb0asBw4t01yewJEK4gNUrRFHt-sjnnD4D6umbURFGGTbfffhTi5sWLA",
    "location": null,
    "date": "28/02/2026 16:17",
    "isVideo": false
  },
  {
    "id": "AF1QipPTKEPqOnqg_-hseARTeC_ggZhjFCCV4m3Th-Qk",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMJNtEjj1PJBmYXLNrJPreZHR_XHGIscOnb_jemLjheLdf9vqcCyOPCRw9pYItNLQaTJ3LNbnL7o8M74if1ucInPkE-0IKv6hE6cbrrfFw68nx2MgVu",
    "location": null,
    "date": "28/02/2026 16:17",
    "isVideo": false
  },
  {
    "id": "AF1QipPZUarwuUJAZVbVYI-59nOyeF3TV2KAM45K28X0",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPQuSrb9VGELZfwP4CQg3cLJovMQkWqvowZoro_zAp8ws3DkUUXLRKSv9ue9r4Z1DJasMxpk58pUTJKABRURXbmxVJjEwcttCuXxxBJbrDFiVOK-V1C",
    "location": null,
    "date": "28/02/2026 16:10",
    "isVideo": true
  },
  {
    "id": "AF1QipP7ROx9p47WjEXU3FXw_XyovMQ0MYwbppkQr4mw",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNYzg2b-n_69ckwwONnpa05p6Dm5oK48gPY_mmUgWiIe__nw9e6bhWFyPd2_3eXPxAyv_12cFzXryOzr2OLnpfWVdEjpuKgtU0Z96GNSansqGoeDg29",
    "location": null,
    "date": "28/02/2026 16:10",
    "isVideo": true
  },
  {
    "id": "AF1QipM2TvM6JxuwcQ9YhvNGTjqoBZ4StlV2hRm0mVYL",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPTGB-zbDEfrGviiPkULBFZDjPSYEUXYlSrlktkbUixYecLoZBd31JT7rWK_1A5E_KqThIgmOM0r6FlTYUKNBX4SCcMSiqrTVpZaP6EtuySE-mNB2rq",
    "location": null,
    "date": "28/02/2026 16:01",
    "isVideo": true
  },
  {
    "id": "AF1QipNp5vs81cxz7ScVFm8okxlpgNgsPovXhnrNwiU3",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczONbEeGM7IsYYtb08M2fBmohWsBjZmbZqBCshT5K9TTGY4usF9aiGHrce0steActqJvriqrceqVrXQCtTxB3_OQDiry-3eXmSNu5Cbc_dDDBnM0U9bs",
    "location": null,
    "date": "28/02/2026 15:59",
    "isVideo": true
  },
  {
    "id": "AF1QipNodUHn2L0fvA-NuF5H8B79CFn92YoIjKkDFTkY",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMpkxfh_xj38dcVgFcbDItux6i2JslZepRC_l0thEUiuodJBQETi7nD5Pn7EOiAD2UJymUygW69Rq0BOkADZHSs6M3Iu5lJlFYbJFBAB2qPRDicbAuj",
    "location": null,
    "date": "28/02/2026 15:58",
    "isVideo": true
  },
  {
    "id": "AF1QipOXVEwJfjX2bXKOYfM08V0ZXn9a86KAWw3VcxgG",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPujdiSo7T5P9DKQDluIo2m9Baoag4_1R8zltpx3jOz-PRV9ctjOU-zDtTeEiG9GIdH9eW997ucSon88WFPMQEwKRvqNXqeIf_CONS9dGcdo28SKZf9",
    "location": null,
    "date": "28/02/2026 15:57",
    "isVideo": true
  },
  {
    "id": "AF1QipP0kffcDg7MohWjr72t8djl4VMYftDw3KXWggFa",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMZD3gslpwwV982w18hywGxL-G0alDUeY-MTMArUHhGplUlqU49Pb6pX4QfsL565J_4oWfL5Snf4Si0TYN0MCh4ejO7uy93ZEPxYQQDXxVcmfli95e1",
    "location": null,
    "date": "28/02/2026 15:57",
    "isVideo": true
  },
  {
    "id": "AF1QipNVMUpTb3mxzy8U_KPw8t4mjuLeZAMeFiKkS1Kh",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP2iQ_CW9ERXO-0arToKaLq1iL8Mp9zNmz0BNZj_1hgIOPnKBkbeAqH53lT2kxE9ElecKTaBRO-LZUXQ_wnTNtTsU1Vxl7bgBGonNbTGGTKRsN0FMDl",
    "location": null,
    "date": "28/02/2026 15:54",
    "isVideo": true
  },
  {
    "id": "AF1QipMFUX6ioroHtsbs_IWJC0YMpJjG333Xs04cF5Y1",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNAdigESYTJ4RPUFyq5V_TWOHvGCp-ZQUjChZpUaVonluqd0P8XgztBQ02egYvbN0Mf-IuxFBpaQgfw-auLycIa3OMv_P-0zwa1FF2tPzPlQZPqR2kq",
    "location": null,
    "date": "28/02/2026 15:44",
    "isVideo": true
  },
  {
    "id": "AF1QipNxVa_Il8U7V1DILXmN5m9zly8Ro_c32nK3T5Si",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPzLP6YIlu2AJ7fkmK5y5YdsxpRqhroXo4IFENSWEX7QHMoYwWMNVYWVpxu77rv_C7ZcrH9UuB_u0uCz5LmK0HOQerZitYgyeSI5iRuNismaPnub3u3",
    "location": null,
    "date": "28/02/2026 15:39",
    "isVideo": true
  },
  {
    "id": "AF1QipP361jJpPBDrr3ww4kIZE12xkaCTh6o0flqckFZ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMmY5p4-nfZ5b6YSRWhmr1AaSxpbRREA-gdsyL1Fx9gxG_SFoiq_qlShW8nPRDfRAAa1NEtom0MSdWgctXWLN_uD8j5fUOQEMh98Ua2liYpslAa6C3s",
    "location": null,
    "date": "28/02/2026 15:38",
    "isVideo": true
  },
  {
    "id": "AF1QipM_vCXXLORoZY5M1AbGMF1BNz12NRezkewVo96s",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNZLsALhFabBpN1v6t7aMEcdK_5_OLn9LVqnmlV-jQJbuEAsb4zoRr79DU67N1KlfSr8cC9djIkpDfnnYvZOOJMg7aZJs4m1ZgyGVkjWeyK05HrTt7F",
    "location": null,
    "date": "28/02/2026 15:38",
    "isVideo": true
  },
  {
    "id": "AF1QipMLbO4-O34pJ0vasD_1QG-1NhUgOw6No2bK10dW",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPeoIF_S6OQK3gWZ1a1Pcn6Vu2-MVIhX55guSI-X2bif8joraqPt6o2Y4qj3LRpGzHIiKC1t9WZLLGHodAoroKPlvZD_zj26e6cs97ltl9fab3NANqk",
    "location": null,
    "date": "28/02/2026 15:35",
    "isVideo": false
  },
  {
    "id": "AF1QipPxZ_1oWQFC_qpSSKvIUq3fF9EsosTjQXdsu9Ez",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOqpdHlQ0q5WhKzBx_SfGb36AbC576rBX8vqNsPCpTpZq51pDGh0I0vnRfcBbc4AFAzKS_XF1CgJA4YjwCXVppvoHODovImaZU22x-VWsQGz91VWoro",
    "location": null,
    "date": "28/02/2026 15:35",
    "isVideo": false
  },
  {
    "id": "AF1QipMj1XdYt4HpKRoESaE9QrZkHkGTe8ijSpzihQRF",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOV2sG35UzJb_hj5o1DYw33xJe-oVLqdS484Vx2sODiVFbskWLkyccmdK4sF08WbCMHbENPql-EsZSpV6Lw0y5n1EtkqsWC-h_iw_Mt12VI3g69qI0F",
    "location": null,
    "date": "28/02/2026 15:35",
    "isVideo": true
  },
  {
    "id": "AF1QipMLTp1iTfW2Dg82HsvefXPbt1UFEePVPPll76Si",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMCL62fRiplTVjVe6X4spQv_DYSRD_nvly2CgPcyp696IszOuYzXMlWgGl80Xegnxr87RlHEnjtYkqQETR5vvkp1mmvr6_3UM6Qm9Qp7vV_Z3HEObGR",
    "location": null,
    "date": "28/02/2026 15:34",
    "isVideo": false
  },
  {
    "id": "AF1QipPmMHXFeOJPxBGLjo7VWWaL84J5in-aAh-LVGd7",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP6nS09aziLbNKjbB5uv9Bnx9_1LylbDT9XXKcrTh003yE9tz5Y5Ovtg9H9ngC7W7N_GB8j5XUbwPlmbI7C6rakCNNB9Bx4_H9i_34K-JGnUj43YP3S",
    "location": null,
    "date": "28/02/2026 15:34",
    "isVideo": false
  },
  {
    "id": "AF1QipPiP53TbL1K_kFnGNvofM0_dQBLztsYUKFB2v0Y",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMNHf6t0wTUcn_mbrgZGqZP772dLCk3FcioC70musNHKkCr2rbnIl4g4JLYhnXilJofKlspDszLWAnzC14v0O4F2Hf_g2CdKPIDw7qmOcLFe2_q5ikT",
    "location": null,
    "date": "28/02/2026 15:34",
    "isVideo": false
  },
  {
    "id": "AF1QipNh3p6k1G331XBjOnRCQJX5RJhpANFMZhzc-ZLN",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMMaZ3ygWysPGufaS3eOWUGa21ijHYNn83OjHQiAKydZsP5VcA_dLjCZVpvHvpNSs4yUl6nMagP8Muc30Cgj-u7CL_il2IVmZcOp7jXlMViNVwuFxuX",
    "location": null,
    "date": "28/02/2026 15:34",
    "isVideo": false
  },
  {
    "id": "AF1QipNDZ4D7-d-VP5skdvej5cfi7AK7XAUT5LRa9d93",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP1L-vFVurj02omC2CaOO1bOfG2auWwIg_NeveYVGwA7-kPtZl9jeLSh1k-q7Zb6nHTJsbKaI-KXoPgfBDBFNI0xkjA_iIaeKnAoHP-HdxGLm-H5Kyj",
    "location": null,
    "date": "28/02/2026 15:34",
    "isVideo": true
  },
  {
    "id": "AF1QipOViVZ-d3Hib4MvecihUWSMRPRjOZzW-lNDcWV8",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNrflX1ET5gAekr6oYglVIrbjPRvfrX1Vph5N850Bed76Rec3g15PjyTpvCvpxWL6yWbkHyITeY5Rg2XmysWyWO7XtuaYYNEEMzJpdAQJBZdYnQTuX_",
    "location": null,
    "date": "28/02/2026 15:34",
    "isVideo": true
  },
  {
    "id": "AF1QipNDPvjulVYGywgBp9scIWYY_nSIK6e4hDKsspCq",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOgoGPai6zVEekqcNAb6qXbIWIyRiKdQXaWLlq3RMPzCzpDidTfh6SxAGJfLvPju7G0pabfQv5tqlgWfJrTvitcVxB96J43IX2FDG2bUvMFHgi4GKyd",
    "location": null,
    "date": "28/02/2026 15:32",
    "isVideo": true
  },
  {
    "id": "AF1QipNNoIbPjXr2TRVjEP0njMtmGnJ69lYlD_uzYC9q",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPmXX4PvdHvKgtHy8lG00zVDZ6DtD94XbUtPviufdtG_r0iO9JsG04_gyz6qJT1_lWK4sWWsb5cHaigsL3qNLGFdq4KRgmDo4sMph1ttoLFJjORviHp",
    "location": null,
    "date": "28/02/2026 15:31",
    "isVideo": false
  },
  {
    "id": "AF1QipOXZrLysXl546EFJdenaNUKGREy8mrzeQUtS8aK",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPMRLv1Vwscu7TqUGQmWjKh82QZq-rfy8YvLtd-ABNqNweNyA_EKHSd_hI7ZLbT16uHS4pS3OTDX0MzdNJ0It_JujKPYm09J6Wby82G2McU2ZowYxph",
    "location": null,
    "date": "28/02/2026 15:31",
    "isVideo": false
  },
  {
    "id": "AF1QipPGM7vg0_i7hQCCDn9t1w_HsgRWY5npDv4lXpQ7",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN-ZqIimSTTWVbq0hae5BYI4L2bYJQRffZSSjq_IhK4xHX8_TJutetzQHsAqWWNirabG7VA-KQxI4jldtRUn-iOH33mZxrznuyhiQpyDDWQ5-ceVpZd",
    "location": null,
    "date": "28/02/2026 15:31",
    "isVideo": true
  },
  {
    "id": "AF1QipME9vV9lVQjvyhQvu7ogM0PccI68o5hATxsJmYv",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNY-F2BBfTO9MzHlhMKcQHQm9CrSMjLr0XYFP5u1D_WYC8KHoXQqFOGU4aAU4plRTfGGGZCi0gCker20eguVxmXzrOw2-F_fxjB0c9f5fvQG3taheBk",
    "location": null,
    "date": "28/02/2026 15:30",
    "isVideo": false
  },
  {
    "id": "AF1QipOPt10QRowEU63ZXiUHMDKOAH3KhTdlM5KZ75Uh",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMAtNzeC-FDWUDK1h2br4moeQrbwJIa8DMOZem1rF0S0Id2hS3cg9io5TDRQoEeVlexCFasRV6sJGaNyh_0_ChEwafomhLgSAnYlgpoeK_4g6B8cwKB",
    "location": null,
    "date": "28/02/2026 15:30",
    "isVideo": true
  },
  {
    "id": "AF1QipPCzEqREluXQ_Yssz2288sFU4ASLaM3MWFzb7JR",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN6OygYX359UyGiVyucIbvn9wEkLOZ6Vnl6flKy5KlZweFuVV6JFVe_4izaVv_4_VrVDl4Q98LEd5K5_9vD5BSyF3EA759fFKb5KrOIoV-RhlyL11qx",
    "location": null,
    "date": "28/02/2026 15:30",
    "isVideo": true
  },
  {
    "id": "AF1QipOPF5I1441ZUM_awtwVHc7pYZQrParanR_DH950",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPwZL6Hon7sax4ctqNyX04ie-WlDqpt01-RYUO83xg7KH35XM8Ea0IEJ0_nqr02o_V8WsZy-mVRMdLL-HdboUqg2MeV49tdSNX-6K8u2c5Zpsjyxn1A",
    "location": null,
    "date": "28/02/2026 15:30",
    "isVideo": true
  },
  {
    "id": "AF1QipOx0GBLVQJJHWrKX6ih7FRugYMGa-BsZzMuVThM",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOJ-Kfi5rlWZu-3lu36762VT0JIPrD4MvAm28j3dXz05kh1TDLDuhzvwy-mVlCq3pjmARciTJyK8KSVpm1M7ZS8s3d9rYJUOgV7h8FtdvLxP21t7-b2",
    "location": null,
    "date": "28/02/2026 15:29",
    "isVideo": false
  },
  {
    "id": "AF1QipMZhkYUPUo-rKYp_oM9XqVlgW0s5KRSdYNbmSH2",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNMpkct8OVEWV6jqUHowS6CL4HNfOo1Ir6XWF5J8v1yE38l8wQNlTtrRnPnykCGe3qPIGRdfYJdGPh5K9_EtPe4IPqf0ccSCTmrT1xX_pqA3Oq5X7Y",
    "location": null,
    "date": "28/02/2026 15:27",
    "isVideo": true
  },
  {
    "id": "AF1QipM4bgbT-wOJimkNpUruJ1Fm8QFM-SkSjAGNQy9M",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOILoFml6BzE5Cz9dtMTGnl3nBWQpHVSj_3fVf8aeeuF88wQmeSlixp1_veTZ80Hcui1svOwhTE0Xm1-f-dqvKDKD2VV59aL-X9slnzcO70VHw-vjuw",
    "location": null,
    "date": "28/02/2026 15:27",
    "isVideo": true
  },
  {
    "id": "AF1QipMCkktYvRThpC31t60julcqFBkq2dCisd4DWYwQ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNIMzQg5AYayOI4_ylnm8_67FbMwtX8ZKcA6g7QtJltgyZqZUgsz1XkHfnF23r43iNLzafKdTbtr_T4w5ihwVNpWA7Tz6wlZbRdK8jhPAQGxBrIHwzI",
    "location": null,
    "date": "28/02/2026 15:27",
    "isVideo": true
  },
  {
    "id": "AF1QipOgmFGQPRJnlNF-_p0I7N56lOtjRa7lJHJ5Q0h0",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMcTYg6PY1mFU0Rv1hP_QYYLIhwr9VAWsuGk3E_Iqi8AGGLECdbLIe_waU3q00xAveKLLnjv5pWAXltN0oIMHvUs3Vb06kp1elWf-mfKpqGnk2V8G0",
    "location": null,
    "date": "28/02/2026 15:27",
    "isVideo": true
  },
  {
    "id": "AF1QipMcHJmBSEg0jm-CwUDEMQzR-xNSJXffliZyy5Dl",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNLz-kuvkEOYOrJqAg7AujV_uvhpO3DhhTE9dJP75xJXgm2rxzE-JWDB55lbocUYJUk5YMuhXiwNMkfMNYs_ICa-49BV1cXy34GICZ2mwfK2sfMHC8",
    "location": null,
    "date": "28/02/2026 15:27",
    "isVideo": true
  },
  {
    "id": "AF1QipObUkQCrcpxKOSvLGH0RraScCQyeRh3MHz7vaoh",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPpeUgP3dYhBnetXsV9XHNIGEeV34n5BZx7zV3nsTqzbr9M6rOEIGZ3POVqOz6ZvP_yfJwBTzqJlANGWYXCTyN6CENksMJ0fjUYIX0-FKMFBxOwhwcY",
    "location": null,
    "date": "28/02/2026 15:27",
    "isVideo": false
  },
  {
    "id": "AF1QipMb9J-mpnCKrgcOLV9MV2YgWCe1tBurHdsrGb2w",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN9Qhws06wG3bOkuzd8Oc-cmTf0L2kXq635Dt3CqmwSvScpH-S2IltnuLGHQR2UL8LlGM8MjOwtB6ZvdqArSj-QTDL4l1PWwMnXzBB-o8h77zFWqCBW",
    "location": null,
    "date": "28/02/2026 15:27",
    "isVideo": false
  },
  {
    "id": "AF1QipMPJney1YTswVlJXG0G2Yw_0z-0tX3NRP0GE8Ki",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMh_3h7EmwYg5UG7PQ4m2OVCnyaYp92GGHhQmBiwYF6Ax1E0NhgHMefxdVf9pv-hjHp02sdOPTYjZmXx6Oh_8DWN-VjbpnQu10qIKtOH4uBO-cMC4k3",
    "location": null,
    "date": "28/02/2026 15:27",
    "isVideo": false
  },
  {
    "id": "AF1QipM7oqJiRn0QBaLJp5xDx1IpZUd7UEtGOo7z-Tub",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMcYyEro0aI0vLGwFv4Zjax4cB75WF5hG_M7uzNITgfxe7ZtdmbKuiC1VTFD4SMex_tKlLzLkanhP4ojrUsL_GDJs4AbtZPnVtgOskqyOTWBSRjofwG",
    "location": null,
    "date": "28/02/2026 15:27",
    "isVideo": false
  },
  {
    "id": "AF1QipOjUaIbVwPI0emy1RMlTo5jyfuwp6rPBhSgp3al",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPw_-tyyvy0s-yFBLg_vJgFxk_Eh1YJlL6IaFRo1LjNHlClPGtgMSfBdEBy4qxlagcl_B51QqK7nvXlDLMMm2cMHNS5MlqzXHbnDMWbL-Vh7xYV0Z9N",
    "location": null,
    "date": "28/02/2026 15:25",
    "isVideo": true
  },
  {
    "id": "AF1QipP1PXW5xul28HD-561D1Gtt6ZctT0PdotsfEohU",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPGzNvv-FcXxgh51tUpw7_RqP3_vLI3rhy_r2mGeOXi2ur8ObEmxdfrKTwkNu74ukMGeTpMruU1MS8fX5WE1wfLTJGYNOZManIuUPTMpTMx__7qFUH5",
    "location": null,
    "date": "28/02/2026 15:22",
    "isVideo": false
  },
  {
    "id": "AF1QipMeUWn6fEMCkXT2DjNpnSj1gD_-AiiVM-NPRZo4",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNW02MR7r1a3hpE9I8XPkgFozb8ZwqyAdcJqtS3eLNxzsIjj_Otlb-rTQTzNXxhu3tn28XcmaVF_C7CDVcEGCJ2t5rMq4LEXeBAcQU4ywaZWargQng9",
    "location": null,
    "date": "28/02/2026 15:18",
    "isVideo": false
  },
  {
    "id": "AF1QipOo2ay0yMF3SqANjDqNQTLUMAgi4XECT10-QPve",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNpFhhtCUs-G2C5tFW5Q_7cb_likgdvyx2N9IZgifPfLMHWY1cRFbYIdDsng2zNnnr8Tag4uS-mWaxJEMDaxAshy0c7adorg432W-xv2i6IzfeqHqjP",
    "location": null,
    "date": "28/02/2026 15:06",
    "isVideo": true
  },
  {
    "id": "AF1QipOsJ49y0SfIa4eEXuIBb47xM1er5UadKuT_Ek20",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN1dt1vLPjMTCugAKIVg3VonMXdQ6r1bDimLUbXpPG4YOHE_uvdK4LbSaWmt0JkqtO-KCLl_WEw8Eya6OZvv5IJtu5_ey7XF3q1yCPqGHAMr5u2cICS",
    "location": null,
    "date": "28/02/2026 15:06",
    "isVideo": false
  },
  {
    "id": "AF1QipMD5ae8JmmSfYCFj8lWxFQFKeS7w0jDHb-r2otq",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN3-pm31aUznVdNNsAjuIWBiUTE3ixGSq080ZkWTk0NaBGjD5N4Bgz1OXcOsr1CnH6zo5OmfrsRtX5g2zRVJxf3a7biZ-8n7g_ew6nEnkU49Yhwjiil",
    "location": null,
    "date": "28/02/2026 15:06",
    "isVideo": true
  },
  {
    "id": "AF1QipPeu-x2HWd1MsfCgoXd421DM-4aKqDarqAwlsDj",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP3wbG6Ac6i7q97JXMZ9u6hNtfd6hFALiX_FWdgPHLhrbPN4QZ7RDPg_-0qLl48QXos2f0z97lldbu95_pHnNBxsQWwr_GoSqUVVSTtMvTr4SAQmrvN",
    "location": null,
    "date": "28/02/2026 15:04",
    "isVideo": false
  },
  {
    "id": "AF1QipNDJY2GTyRr98NFxvE1JpAnkjRjepbmDErP-LGd",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNbTITOXurwOEP6dhmoneg0YsktUE1q8DMPnPFc9pRXQ-oyfwrLPwRlJphlbWWtgeCr6CrAMMRaeicWnfhzEU5-k0EEF9q9-V0ZIuao-2f6lYyhvESC",
    "location": null,
    "date": "28/02/2026 15:04",
    "isVideo": false
  },
  {
    "id": "AF1QipMGEh3DohwItJgaVXLIKNxOCDg0I5y2FQjgsQbG",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMmihTgsWBje-GQ015YIWNPSIKncK-epxPZwfl5DzXC3gvi_iagCAN0B2TmvL8xiiyMHPltc-sd_UB2i2ztrS4fxwv_SxURNHKjgJev0SkkEH4staDC",
    "location": null,
    "date": "28/02/2026 15:04",
    "isVideo": false
  },
  {
    "id": "AF1QipMK-V2y_B7rIG4EbTxM6dX-7vrVgxby5cuX-0cI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM0amWwbAI-9knVPucmjieyazZw9Y6Kpe-XhB119FnmIqhOPhvZIYz8e9B9sv1ikrCGXQK6co2p1AJK9H6u8BNRlSTYuYuudv1Q9QBcf97PxRMKyUx7",
    "location": null,
    "date": "28/02/2026 15:04",
    "isVideo": false
  },
  {
    "id": "AF1QipMbtsRKDejQnpXnM4CHbzIfOTvXD4ORQr1cSDB0",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNd-M7ZrJN5ss1QcxktBWCndBQHhE5UkyX_NjV9cobVq3HmUvChLQrHBDPkUAcWE_V73eUB8IvmSXCx515YhB4A-Q8PusteVAeiSlqV9hxxxs2qdBT2",
    "location": null,
    "date": "28/02/2026 15:04",
    "isVideo": false
  },
  {
    "id": "AF1QipPgE8e8AvR7vpUEXeoQBLcMOViUuFRgnCgyCjR7",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPDzIvPx_mi4cZmLQZJkI0Md_AOpShhVYl-Bm02R8mjg2vxdzxJzWsWKWBLyesXUSkwdfIFJWRIm7WorJvce3dwQXZ3Bt7imtvvL5AkHE-QnHVF_ta8",
    "location": null,
    "date": "28/02/2026 15:02",
    "isVideo": false
  },
  {
    "id": "AF1QipPgrRL_j-upXAsVQaSrUKcknv6lwIajNtFUfbdC",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMhRwWtpo3Jo8TJDjep9iTvOw1FAflBNwRIhj_7UxuN2sGYNpd7HaogQKFYLcQ_psnn2R-9mAQrD_i-a5_peytA5HCYGFsnv7EXXKepeUBdS2jyoFC7",
    "location": null,
    "date": "28/02/2026 15:02",
    "isVideo": false
  },
  {
    "id": "AF1QipOh4G8ysk5ATh-A40yWobuHX50uLCbvcEwkg5Fp",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNLHa2KgxuiNgxErUEByAoSxIhSjLEicUKIeMEZTa5lK2PM1gqYFafOPd_2-vq4WQo8uVIyAzm69Ye6kmQjHzwoe9Kgh1vdH3NNfP0xMDPvE_C-Eehv",
    "location": null,
    "date": "28/02/2026 14:47",
    "isVideo": false
  },
  {
    "id": "AF1QipOfuRzttGRrlcgaeiGVP2LmB4RWXI-88fR_QpGJ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPq_ajhT5LPooyJERcadcD8l2r3rn_Eq1lt0pS8wBrL6nGgCrlkTj5EerNsnVuiJ2_wBE04Mp8asU4QKVEfywKYyMGcidQzwZ7by5zp-eqytTUrK4k",
    "location": null,
    "date": "28/02/2026 14:42",
    "isVideo": true
  },
  {
    "id": "AF1QipNI7KEC-iNpJN0KdQd91CUXOQYbh1okd-YQMAM_",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNuGy1_zZVUTc-7MiTVmSX_Uo2keZgvRJeekihYjAPnVk-vz5dVURYVI-a4WUl_pCC3C4xCfN2o-vj3PTWf5v3T8WRf6J05D0OZv9G2F-uf1BlpaLcX",
    "location": null,
    "date": "28/02/2026 14:36",
    "isVideo": true
  },
  {
    "id": "AF1QipNdogaJG9dQMkica6tk9yQSntbip8XklQe0yCIe",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN1EoWqcpYCmHfaXHQjPehyA4jD_PfTx-b_41v70YXqmRH4Y6hMLJXc78tu4_pISrwESKEkRv-EduGMA4gaVSvwwsfY5In-7W3pPj67qZBnrZmWyw2v",
    "location": null,
    "date": "28/02/2026 14:36",
    "isVideo": true
  },
  {
    "id": "AF1QipPQgPWqV11rEWvbLORuZirwvjLPfhnZp3mEeTGX",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczObH4RchLV2Lv-Zuc_M4MYAgEnlzOsWQa_Rtxo7eg25jojCstsj5YwdAGaUvf2IpEDNtEdM4dU4FemtPkiu_SJh4XGcLsRDy7xZAGWOkt7N1KuQ6_cf",
    "location": null,
    "date": "28/02/2026 14:36",
    "isVideo": true
  },
  {
    "id": "AF1QipN-UKJLOpEYULmnPiJGS0L7cMBzO0Wenz3AxCxH",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOdNeBVMLcIipislZjafJlxzXPAO6EYec-PWDR3fXxZrlNyCD-dAn8bqnaBS1N98yrW4UNuW3M2kMfr6q9CLcI8kwQAPDXr-ejHPXfJVDGXoTbNmC0m",
    "location": null,
    "date": "28/02/2026 14:35",
    "isVideo": false
  },
  {
    "id": "AF1QipMG_IaEB3eMl1ntGpJ2mLtlNQTddFDaL_gjVGep",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNx6e8iT4PEIU_X0H1xJe5ljsCpvF_3RE9AY44FiPajSbTsSJaYALQf6ERGUW6nu8gDphVduDLhdc-0ZMVi-ysriLVzq6fwLbSF0CfyxGUAKaHr6bI1",
    "location": null,
    "date": "28/02/2026 14:35",
    "isVideo": false
  },
  {
    "id": "AF1QipN0MgIDNIzGi2zbB8EGnbeeZv2hAqBisxq-BdW3",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMavNuqEjiB5Yy17gsVZ8nkEpmak_2KFGYHbGacNvM6eCENHfEBpxXKcuMz0xblOpFMT9QKAMA-vDmHqa1wP4lp1gl0pyzsl_U5p9eoopINBo--PuJs",
    "location": null,
    "date": "28/02/2026 14:35",
    "isVideo": true
  },
  {
    "id": "AF1QipMdQBTXS5E59dGxaubn--WlQVd99wC7yGGXMwev",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOZuK_1S6E0-SVff_nwuCmFcvccbJRiDIvzESXFvCaNd8hjTXgjz17HNuK7N4H1AY-w1JTohfKfX4m8QdZ7G82URshi6oaL6xH3Y7z-trpyK7x6il3t",
    "location": null,
    "date": "28/02/2026 14:35",
    "isVideo": true
  },
  {
    "id": "AF1QipOkp-P3eq6v-f4Qc68LvRD5VGVa6BVtzgs4G45U",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPppFoEBxa5mS0IGQtGZPKKAiPjY4JBVea5zX9_xbr8MDyC6eZLWnSc8yl2ZtV24jEKQr-zjOCpQD-nFKuwP7LUIk9g7lmCwLzOrO1s9sSpom2KvkM",
    "location": null,
    "date": "28/02/2026 14:34",
    "isVideo": true
  },
  {
    "id": "AF1QipNzEDRETvnNTie7oq_D6KUVB2A02FXb9thouE-f",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNgCv1HlC1G02YdGY2zIivqwqBfGWZJheRHmTjgCOUg-plRx2Wn396Vt8kEAiJkLWkQZjtj2Ae0XQSCXAlGKQek8YVtjCTYLR2lM1BTYG8ZETCMrYA",
    "location": null,
    "date": "28/02/2026 14:34",
    "isVideo": true
  },
  {
    "id": "AF1QipMRivT5TQklUbkqa6FITuHA8CiDlzBPMzLOJTWF",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNLFqZbywN-deGqL0gx4Abf03YyCACh7iewTiOuzDsRAyN1hc6DdyhTrcnFTjw1hSS-Z-h3YCkT5pD56AZUy2o5Yalv78gy3aRWX-wcssbX7_824Ww",
    "location": null,
    "date": "28/02/2026 14:33",
    "isVideo": true
  },
  {
    "id": "AF1QipMR8c0DeAtLq1lxte7KJSo7aCaPeLfQDof-2zPV",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM7n3v7JGu-Knm5iKzzejYwVbk1_27ny5rEPN1DmPzv1c65BcQK0N00K6P5wxoJZdZXl7ti8jyVpB8GXNswNCcC_WaQYeNM7QVs5KpmqPb9bqRiAGo",
    "location": null,
    "date": "28/02/2026 14:33",
    "isVideo": true
  },
  {
    "id": "AF1QipNNS3jRGuaY7VWqqAdFI7RncczZ7dhSWzZXc9B1",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPNtxgpoZABgRIVJ9qBH7LuSdLNEO57SHSbKi8PEHvuKZHu_vkg6t1gdLt6HETuC35eyrM0B2xyciXU_bwHIaD9zWwjVRvmvQ6pYnUFQBjE2VRLvYc",
    "location": null,
    "date": "28/02/2026 14:29",
    "isVideo": true
  },
  {
    "id": "AF1QipOn00O9135eXKNWyf3kAiVeIFRsJlr713JKU-Z8",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOJ0sBFe0XyioXBKnVUPJIiPIFQAwgI0HzYnvWqPlQCFQh0TBYXDQlL91xU2Zv2afcMA-pttdBsy8Vqyp6-gE8U5flL9frAAgOkd_CP49lwglKgX1ur",
    "location": null,
    "date": "28/02/2026 14:29",
    "isVideo": false
  },
  {
    "id": "AF1QipOeTlIEN5Lzvcuaz5KKMbykRTZkcnaIxdFf89pJ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNOcxNeESlOeVdvOud7O3tPsAu2OPvFG8XmFZREbfGHUfHgZgX6qyOKgAqw-TrNCxJYe6BKqmQPPAT3yXY47ATIZw1Y9x8Y-Zc6ikec_EcgKFHuVZF3",
    "location": null,
    "date": "28/02/2026 14:29",
    "isVideo": false
  },
  {
    "id": "AF1QipPSETxUbVpNRb3hCp1zZYOOeqmstb-uZFpZOyTn",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM4Gp7Kz4Tk7LHdL7yi44KOnQEOcvAYOmm9bjd0ayQa67QzXO7Z3WFmY1uEgioPGRPdRaOXm1-5VMw3YeSN2qOvzmMiOg8zDeA1LKvtNPWmGpAaEP8",
    "location": null,
    "date": "28/02/2026 14:28",
    "isVideo": true
  },
  {
    "id": "AF1QipPu176i4KLx0pG2VZGuxMdpsVnpj1uGxVJq1tce",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMzjSCrquQNWM-fEJqf8rBAny9b7cctMUwrVEmHQhbKr1b_-zqno1lqebGj5eMG1SZYKLJrH5T5cPSkBfDxkDXonmKNxzOBleLvoADd-SF7rOw3aqsl",
    "location": null,
    "date": "28/02/2026 14:27",
    "isVideo": true
  },
  {
    "id": "AF1QipO7xoXOT38Af_1DNPqlY8YbbHr46qqQ2IGaH9cC",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNPV1qB62KTBOcTrW52oLHgHrlyopyDt7qE9rme6qsQe5KVxvhNiL1rbVkF91SHL4VX5fFwBq84Qe59XTuadEnJwidtB1b8wJsU3mXVbgmyLqr7NLFq",
    "location": null,
    "date": "27/02/2026 00:49",
    "isVideo": false
  },
  {
    "id": "AF1QipMxbsIgPDe3WqEtGwkEahqpRlAluQLyFqD8yW19",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOmPfLdVkkCNBqTYB8x8ZgGoPeVb_YDb3t0UvBg5YQ0R4BUYsQBXY-Z0su-QLWDIr9kYz0Xti_zeyVS_UWGQJKszOh5GB28wJFf7Zlj2J9o2ZFoMdMH",
    "location": null,
    "date": "27/02/2026 00:49",
    "isVideo": false
  },
  {
    "id": "AF1QipNLQa_z4Me1y0lLA8nykz156J9SNcjX6Mulz0GR",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMnBF_vk8RHNdGQI5pb7-6FMVqy4dEJxG_biwG7L71Nagh0nr_vrOb3Ctp6YihxiGyIp-ORUPZLrR1fDw4Xu8htuC6NnRhD9MAPtNA0XI7cgY8jFVUJ",
    "location": null,
    "date": "27/02/2026 00:49",
    "isVideo": false
  },
  {
    "id": "AF1QipNgcOwGrLsStQnllXBl0ijR7-ZEAmHx-hh8xnLq",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP7SO-Meg2Xy3P2xzt2czOv8npRglQg66Ok_oKGDfsuvWgm2G4LSPuN9qRQtQs5Pmknd7QVbghwola-UyZ3v2peum6LZ63tGQ3PCmjPepcaLjMO1QAN",
    "location": null,
    "date": "27/02/2026 00:49",
    "isVideo": false
  },
  {
    "id": "AF1QipOemhDKgexocD8VLguzGwxarJUbqCKdXC1juzum",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNEWHmbwPELprFnXOdjXy1Qmw2PJM9jNRx_fwNiai6NHjQV9b6-9fPh96PTERMInVvhWUrsf3oSdtto73BG3jti7lxbvcdckTfwGHdrUOg8A9j_wJzS",
    "location": null,
    "date": "27/02/2026 00:49",
    "isVideo": false
  },
  {
    "id": "AF1QipP59EZGCNe_Doh7cq4_tG-qSm08ohkzxsa2QGnd",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOECiuzWI--C8K2c8CX2X_tjE6o1YyYm9m2Fw_Pz4t4YP6L2zbIdFh2eyGq2DakYeK-5JKAKy9kX3u9e3i9uVz3wHD6AyjJH5Nvj_to36GxOU20YJ-r",
    "location": null,
    "date": "27/02/2026 00:49",
    "isVideo": false
  },
  {
    "id": "AF1QipPuxc7sh58PXiFyyj7CAT4Y7MWj4FAlfQtk5Hsa",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOi5kI8SWoguPDrBpEClmhqJbpkStg-IqxD5CWC_mIkvY1d5M_xzIDsnpA7318ALTpvc1WSfzc4vBqeN3TEsNVaPSrLvgXCesk-XNkyWtZAd7KIHTc",
    "location": null,
    "date": "26/02/2026 21:58",
    "isVideo": false
  },
  {
    "id": "AF1QipPIL6arDJuqZ7141d0h39szv0ecXsK9QZsXCzEG",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMxIUfFaoI_Sov4s6tDcbAT57UL9ZqbSl0ETHpIT-jkJaDURZSQCua5O2y557JsJJsSEue2LVLjucqT24Ft26t1PFt7OUfkr4Ci5DNhKuDAJ4nI2kIh",
    "location": null,
    "date": "26/02/2026 21:57",
    "isVideo": false
  },
  {
    "id": "AF1QipOqOzPcFtuo1eq5QzpbzTR8jjS7rWpBJoipAqKq",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP1Gn_Y2XT4pMg4mGBBSUjrv7BTpqW3UPTBvFL5BzBYmn1-jQZILdtDkJEFp-C-tFcIEJkBzqBkGCLhqOg9VRfDRgjnVzLY303jSwRiNXV79ymJwxsf",
    "location": null,
    "date": "26/02/2026 21:49",
    "isVideo": false
  },
  {
    "id": "AF1QipP8wJRgGF0-8gnTDY-ckJfLxTh1raGVpGJq63hX",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM_--EC5R9Bn6Gfcih-i38VspKSqaQElkQzgMCa-gA0R3fL0BBTfohYW4fcpiD-YNkpXInT5ZdbRgh-_u6WS15T2Z5VGhFJrIalSMCds3lVx4Ll66FT",
    "location": null,
    "date": "26/02/2026 21:48",
    "isVideo": false
  },
  {
    "id": "AF1QipO9xx7cDob3_wJtOf5F7e_AE6I5mC0ilRennZck",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMzQAsIbwAxMpkn4PH-apz-F3i509nWAH65Q79k4qFlF4vPO7sgc-iVZIuj6E3xrqjMu1L8S2x8fqsXINbNDDx367DYMGST0J-J7zbCj0GpO1XbGteE",
    "location": null,
    "date": "26/02/2026 21:47",
    "isVideo": false
  },
  {
    "id": "AF1QipNKGeBxLGObDVX2hurG2F3JE_WQXZshwxfUni7G",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPSXj93aSrq-_NLH1m8z_OycioquiJGI1-fxLSaMmKecb_Q7U6aosz6Xi5qld6aXDHbXXf9ARL5i3z-kvwKlaw-aeTcGnNC5sEGfWXFMjEUYQg--k_V",
    "location": null,
    "date": "26/02/2026 21:47",
    "isVideo": false
  },
  {
    "id": "AF1QipPgYFJC0LBssn_ZF22VNPTbrZQKa8yiXw2I5pd0",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMerF1ojewC76S8Ks8M54N1yKGD-Wwg3sLv-FGPxxXczig7pv64ppjUKxrVxc113NET5_yxJOea4fkjZbq3k4c7QYjOIpXl8UapYeLwFfVsHolLlhUr",
    "location": null,
    "date": "26/02/2026 21:47",
    "isVideo": false
  },
  {
    "id": "AF1QipOOOdBVjxnW6HaVe_NLjeo3zclqbGdGQiyTGFQ4",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOTZTQee0-u6IzTMxs5aIHsSuprhfZbALEynZnpjfNdZSywwFrLOC3h20F7I9CRh6jaqRi1CROA0b8BnPKihLkn13jICwPj92lji_fIDraiG9WKZqq3",
    "location": null,
    "date": "26/02/2026 21:47",
    "isVideo": false
  },
  {
    "id": "AF1QipOqZOs1AXuXEt6GvN-rim5QAgAiDf86Lc-GjlPB",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPkDwwYROoPs3hTNWk4hDBWjaIUXGWL29xvdz9vxi2bJ7dwOSH4yL60-lJnOzISPqgLi1KwlmqEHQtFW0KbPONiHIrUi09dX5vswOq1X1SHA1_H4M_E",
    "location": null,
    "date": "26/02/2026 21:05",
    "isVideo": true
  },
  {
    "id": "AF1QipPQ36NPWVrnAyKPzIYNL2n54grQH1vfu52Ex8dP",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNPluYdEIS7y0bTWfH3lFva6eDEEbKuEIeBKylzHSkXvBRVIuQJqjq8DbGPiEnyhVlPl2jr8pe82hNA5eTHixhOgI2zLcb1-GN9dz9ozBm95sItT3w",
    "location": null,
    "date": "26/02/2026 20:10",
    "isVideo": true
  },
  {
    "id": "AF1QipPBuAGhRYDKl1E7QQnOOkwfqu3R1Q7sNHRcOfMo",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPXdFQBNg9PyAXh4q5aWNwkDxzmLobBvh9bl6V4LeEDVx-SghqCU6hmF4eKsx76VNqr0uRvkghBNQ0MbIT1Pn8Lkv7zdqWPWtUBJVLlpd3VJixcm90",
    "location": null,
    "date": "26/02/2026 20:10",
    "isVideo": true
  },
  {
    "id": "AF1QipMYR1YCN88vxsNldK3Ck-pC9jE_xdHj74JrL1eJ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMokKOWbl9b_aDYhdTQOSvX9qHxgN0R922o73l8JNNJVBKQ78-03dOfzTfmohgZGGRhXCH63rIMGhn_byr6pmi6eGbLnBfIhFa6-3muemeadQHukmc",
    "location": null,
    "date": "26/02/2026 20:10",
    "isVideo": true
  },
  {
    "id": "AF1QipPO5I0lfnk25eLXEXUrND8TYsvrrBdZyintS5NM",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMrQ9zfD55AW-2ZYohcX52qDHVA_9kctQsz0gDp0RQnQL7hIMcbrzbAZtLzsllo-Wiu-u1bWnlrjrKxbmWC_31QGkuoadu_ihuS0mo_Kqdf4NO7rts",
    "location": null,
    "date": "26/02/2026 20:09",
    "isVideo": true
  },
  {
    "id": "AF1QipP4sPWgButLu3sGVbl-5Gc0wrr70nH3f7Qn4zJV",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOhlaHk27n-gs9lB7_sJCajVImkg5iiYdUG9bewpIbnTXRWiFcYKl2ORSrkXmYI65dSuQQdHov6e7UIGjrxarYqZia1p1BGw92jmlVC608-_zlS91m-",
    "location": null,
    "date": "26/02/2026 20:09",
    "isVideo": true
  },
  {
    "id": "AF1QipNBuuyAv52QZGGazMlJuSahZM-kwd1mlaOZ2swN",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMfINg-pAQgrRVv4eztIsCzxnm-b1aqRnX18VDCi2IlwsHf3kg6c9AFoqjE81iRrt_jgu-sHqLZbCrXIDQ3HJD_DWBF-A2INGyO3o9suUw18CANhIY",
    "location": null,
    "date": "26/02/2026 20:09",
    "isVideo": true
  },
  {
    "id": "AF1QipPhasfxb1_gUsAAAxLdSrX00tWaeBKRq3qGrkut",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNGPfrycxZABfSNNcDgkGsfQQivkqS2zi3KJ09wNhojnND4ZirClP2mfvcpiOC-EitcZ3JF33XsA_z_qUL8sO5PlFqFZw0atMRBFELcsvkH0WmxeDuY",
    "location": null,
    "date": "26/02/2026 20:09",
    "isVideo": false
  },
  {
    "id": "AF1QipPKWSE41yPQ7DJddz5Utiu_WK8bN3dXG1UyrWCx",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPcKbgK-B12UjlP_0zctMMmSfZRXMgNSSgZgVnv8De7MtJcrBBmaARNJpZWlQ6IB5HIhWZcCoGE8eWieK4PY5Zdd67qQ0yf4sQ3MyJXgW_rYr8Xj24J",
    "location": null,
    "date": "26/02/2026 20:09",
    "isVideo": false
  },
  {
    "id": "AF1QipMfhXYgcBD_xj4T6LqvvG-UZTVwaYNM07YwUoh-",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNTQ-oZlaBunDamFgMgPPJCI6AklQADtDajEsFIK5Hb5lYi3HMIuBI5E7gGHk0ufeCMI_BW8qaC87gVWz5Dr84XhkfI1N8-9UIbXjGxpIXyDCoI1De3",
    "location": null,
    "date": "26/02/2026 20:07",
    "isVideo": false
  },
  {
    "id": "AF1QipMwAry8QTcvoQwJZYRBGSCVKPQPg1BhSilIRH4Y",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMEwt41wO36jvE_RZGwW32lCWrpv4TgQV2WoBD5ZICCxdJABX616oZV-qV6h-oqDRUZ1Mn17_WMRW5feWSM0J-KY6GawUkwwBzqLI1hG_rPDQlctpnF",
    "location": null,
    "date": "26/02/2026 20:07",
    "isVideo": false
  },
  {
    "id": "AF1QipPSqT2yE4zSXxpCLmVp6OoAwPzlPB_rABUet9iI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNKCDUo0EYjP34-9KK-b0DH-AigguTsVAVenTFvXmopR_PbEf7wVNjF5w7aLoO_-WbOXOICWn_dPkq4laS_28jWOc-vLy9xPkpg3M-2ZyW8HlAPucRN",
    "location": null,
    "date": "26/02/2026 20:07",
    "isVideo": false
  },
  {
    "id": "AF1QipNZpDNRslrMVF3vzuarkZrRX0Lpxo3UmCRmpluh",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM7wIWGLKyNN_GyfVIP2B9yrkissjiIJKic2Xr2ky-yh6H3MHigGdddaJtC-81YIdwd5kq8iM6ycuBGsDf1fU8Di2AzaxjrsmSecXy7b8fceC_8p9D1",
    "location": null,
    "date": "26/02/2026 20:06",
    "isVideo": false
  },
  {
    "id": "AF1QipNqW7Tsh39cZyW_aEiNjozTM50ANpdax5ziy6C2",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMEvTdboX45LVvMk0L6zZsQNUTZJl7Xek2OUnhqqipENVa6GR7XxzVbblmeS2bsL1hy49WzfAVLJmdrx2VEf40Q6QdByctxGsUxuQQqXnsWJ_ES6KQP",
    "location": null,
    "date": "26/02/2026 20:05",
    "isVideo": false
  },
  {
    "id": "AF1QipMEy8i1fWCDFVkfxlJ025pBN3Hny-2n19dF55Xr",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNl5XTZSceHitUzIzbFmD-hwx-6zk-ouhU5hs5RLCJVetKPAr7NjplXZIDleEfHXhlGlUI_YszvMvFSGFVhrIwTN__4r2GMTEngQGNW0Ap_gaT8p1XE",
    "location": null,
    "date": "20/02/2026 19:23",
    "isVideo": false
  },
  {
    "id": "AF1QipN_-UE-B1bEWHRvQ0YJ4yy7IKoB8gCr2GmUhR0n",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOMC19n0kEX3n73wfdtAJyWBwMxdsxSY4WYdeDKLXSE7REpFeV6O9UHIn-Qf_U8EdNnDsrqgT3pL3dYY4wwnnU8IH69vgRRABiykeKwVTP9GcBgNIRB",
    "location": null,
    "date": "20/02/2026 19:22",
    "isVideo": false
  },
  {
    "id": "AF1QipORbsuxYBIgfXjulHOKfP9n8Hqp7zNdgc7UJpKI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO5twC5xOWftwuOjez01FiYvgsMJIQ9BCGhwI9N1oX4KX5PH1o7KDk8EsqryYfuUIaYMkpiME4Maib4WpfqpORP4ZAi0V7RDDsYyQJyvDZfVCCyU1ZH",
    "location": null,
    "date": "20/02/2026 19:22",
    "isVideo": false
  },
  {
    "id": "AF1QipN6QgLDrYoxxb_sSJZWU-D04X-vWuhY69P22EeI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOOvC-Hk4msnmugbyh0-qtfnNBa_D-NIYg7wF5MPVA6Q40FYYQsdEajo5HjwFvxHfFuFcQicSUSib7GHUXkyv3Acki0ejaURXS8AvrBo76Bj7m89DaM",
    "location": null,
    "date": "20/02/2026 19:22",
    "isVideo": false
  },
  {
    "id": "AF1QipOqwtnf2FnJOc03fgUnGA_l6ZPwVdaqmrXyDoQn",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOWxjpnTiNcyNyZZWIYy2ugMh9pC1qtXv5H1Q8aWfcW7r6og76lzmToU7gPNWlxIxvMAHg7PtDfZUYDsZDn0sotrLzZjCuZd3-EDAq1NclzrwoWTV7a",
    "location": null,
    "date": "20/02/2026 15:15",
    "isVideo": false
  },
  {
    "id": "AF1QipMZa8LHWyNc2J0TkvCpdJ20RW5vg2n8YsAV19En",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOh12j7hC994EUrMs6OKVGtb7XDiuVLjBn3rPOHdnbhJrmNlIBAqRVuvlLt_KOGn9RvWrQRTQmaYG7GRbxtUIgWlSG8PY646jujzLaz5Hn_LF8lZPN0",
    "location": null,
    "date": "20/02/2026 15:15",
    "isVideo": false
  },
  {
    "id": "AF1QipN4Hv7CyCbl-YzXvIa5QDNPgXeKaJ-UDZ-vh3oI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOuv66bSXU8Ee5StVEzzywC7GOseHBQTQ1MYklJBAIsmbtYaFSUg6ADtVQCXRjVOq7431xdeSGDEwKVqTs1eVwIWsQ7_2AcDNtpLkBTXzGkN32E3Mec",
    "location": null,
    "date": "20/02/2026 14:09",
    "isVideo": true
  },
  {
    "id": "AF1QipOX-3rkQAe-9A6Cr_uXWmtDhNEMTj2bcdjymUyj",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMvxjrnEdggg0jJpGtQlKbYoqFPdUsOtmhfCf0Pt2nopAqi9dnyj54mfWhYZjaY-ud2N0TMPkkUneO0I1HyN8mgA0QfV4TK6EfsYTqo1pT7ZVL4IvQW",
    "location": null,
    "date": "20/02/2026 14:09",
    "isVideo": true
  },
  {
    "id": "AF1QipNFrKyXvyUKlOgrb0KsuLaeJYX0QWaiREKCmnQI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNgAXz7lPflDdPuBzn6wZAmaHlgF31j5Cfj2DdVLDN0T5IYUPURbXa0TznevVoboEU4MKFTPNfIAhUzV3qRRRcBJglzceV4TYriWkvyi5pC6eoFSr84",
    "location": null,
    "date": "20/02/2026 14:08",
    "isVideo": true
  },
  {
    "id": "AF1QipPFLhvkeQ1WLx0zSEOu_1VBF7sV1pOix8Zipero",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNmukRE8fFRLX_kaS5sZ43lK-vn7vEbnjGm2ZXSlAkZnim7eQ3MxKWSqUOBLAV0juc9WWTPglGgzb7laI3Q01o3Uz98oFUbWLKGVK2OFpzkFkGUX9Fe",
    "location": null,
    "date": "20/02/2026 14:08",
    "isVideo": true
  },
  {
    "id": "AF1QipNfZC5Z1ARfYjZbfrhhWKTJmGeEqoRMNqx7Hs2X",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN4wZJB5Z9z27dVqfqRJT37QVWdHcNiJuzD4x0CqE0nPTArXEA_KEiCG4GkqU-g6wJLKzl8zG06sVUJMEmNPFFQOxyziX-6mzgYghnkct6WSEWWvkkn",
    "location": null,
    "date": "20/02/2026 11:05",
    "isVideo": true
  },
  {
    "id": "AF1QipOeSDKB2RBGgeGUBwfwKC3ebrBGPmg4apdtdgdf",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNLTzPqXcg6a7aHRauhCLdJ80PmE2syAyu6oHOBoVh9D7aTuRpG0N2AfmDMNiSdw0_hFr5pgeESXTjHa3IMU7YsVab8hZtHJNA8sJm1UDo7sJeUt15e",
    "location": null,
    "date": "20/02/2026 10:51",
    "isVideo": true
  },
  {
    "id": "AF1QipMD-8tQfFWmgHo9WDrrK4aoPBYNq0rcNeKrBs_m",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMunBQt1PZjZ4uPtHEstL9CDQHKiRCT_hGRzcBOCvHDJzChSiDBtyyC2bz-7EuDuCtNZ0Xx5e7ClCUrDDwPIgXt73qY_W-tnZVJrLZi5KmtQzZ_kfui",
    "location": null,
    "date": "20/02/2026 08:03",
    "isVideo": false
  },
  {
    "id": "AF1QipPU-uE6TpAZgugFO_Bk-J-J6IeaQCjCx5ulUl7J",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPbgkvieMHVB96U5La8ROmVxicpHiCGRpnAyB7hFZs7NG5vtL9HERufTVOZOO4GwR66-PUQKKu5PHZ4WMbnnDsRUXTJc96i7ZoEmpQRQJFsMRez4gDl",
    "location": null,
    "date": "19/02/2026 16:45",
    "isVideo": true
  },
  {
    "id": "AF1QipMpOe2UUy4I5FnZPRkOF4gKNviu63S2AuRrQG4F",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN3bg8C-IRDboygZOzVhEjZQYzEcBJ7m4-R_jQkAorAaQBtPWRRQsg1ZVMKRnU3xImmkiIXkCnc9z3TKD_97YnJtKOgRKmaGWquZC72RTPaE5wa2bg8",
    "location": null,
    "date": "19/02/2026 16:45",
    "isVideo": true
  },
  {
    "id": "AF1QipPEj8Nw0RmFhl8db9VXLJNydu-xAgX2MPSeE0-Y",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMkaRkGPwZRZvdH0ogjGHqa1Pght9totHkawB4UlyYQJBPI3bsERw3snKSmktwQ8fL6WKY4X0M8n-rlxURwxak9RKOdmKWWPPyi6nEcJnk3TgzXJp1p",
    "location": null,
    "date": "19/02/2026 15:17",
    "isVideo": true
  },
  {
    "id": "AF1QipO9r3tYKxG3Y2NIuw7g3c2oAPJ9xZeHbdqJwe7w",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMbLF4apc2F1eyRTKOolMX9UjlTugCxgGTRDwHqr8lCzRMBDkb43nhazwv-76IICQ36E_sGpeCinR0ZlB6vcym5n85cYAgNmopPACnJlI3NEQfQ7fUO",
    "location": null,
    "date": "04/02/2026 21:29",
    "isVideo": true
  },
  {
    "id": "AF1QipMigjhYMVQSDEPUe3uYxhEeqxavVlRUBdwlgsA2",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOqKY7mGTbe5eq46oFg7N7ldfJyjOL4fcFQnzGM26g5m4uUfSMF567l7O5donDdHjjpkVP6XtcHeCwBq48q9-xeA2IUbSCmM3NaP6ur_crjxdnYoaeu",
    "location": null,
    "date": "04/02/2026 21:28",
    "isVideo": false
  },
  {
    "id": "AF1QipPJUtwNuECRZnVQuyh6M8egkjNP0nvOi-pCTjwv",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNzygCsyZ2a85yrvo6teph9eM-WWpcg5ADWdEsEgdbm7QRsMbh2IC_0m6sLmlUa85AzjTzs_z2zdLJ0onY0W-fAeIIAMGUhNPscC0HdfHtGYl965efC",
    "location": null,
    "date": "04/02/2026 21:28",
    "isVideo": false
  },
  {
    "id": "AF1QipMkAQbU2m33w_kby-xs6oGvlPbSQShTSWoA9JJi",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOt_kRNxCygsb5t-tp8GmIIO6sf6MfV4vZsDeVZP8SM4Qrg9jDVDSsqECS0f44JYhOYjtvSZB1U0a31K0f2F2wbjWjsjsyU8AQZ79imcLY445aXF0q5",
    "location": null,
    "date": "04/02/2026 21:27",
    "isVideo": false
  },
  {
    "id": "AF1QipOWKRwCtxR95BDQ62ciwnBYe8Wr3efjeOO8rEEg",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPfZWI4TeyP-RngVt-HXRjx75cX2YS3AnMZhePFB7trXYgAWKtiZ4mnE7rzXZAhdjKov5Z-c1p9qcrLOYvbfXxLk4_pIWxieyLZYxhzhqFMatpjwWBD",
    "location": null,
    "date": "04/02/2026 21:25",
    "isVideo": false
  },
  {
    "id": "AF1QipNFhSLXrEGG48GXOWmPUHkzLzF5nF9YBh_jY0X6",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMJwrVEeq7-BWyddstAahzZjX7KtRHqSAp8Gy_4juTx4Rf8y81I-zKh4p1Y8QeHuEL43vPdiiN--gI6wiPmBrVCDHzfSDP4KtPnDgyUKIpVSWCuQWWn",
    "location": null,
    "date": "04/02/2026 21:25",
    "isVideo": false
  },
  {
    "id": "AF1QipN_hdVAJLmSoTze4zAsmWqHCsBWchTgVE9AbEA3",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOVr2W-6Pl_mwIb1N2EMLzg8EVKDlnxIC9hgjxLo2nlRWknYPHrwIpNHCXHpQsZ0qb2GC_Z5fGGsKii_rRnwizqMuecGixorct3RIvY3duNfdvVOPAN",
    "location": null,
    "date": "04/02/2026 21:25",
    "isVideo": false
  },
  {
    "id": "AF1QipN9DXZZ5_doR7OfWNsbd8lxLWHvskQeTiOsaHOk",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOmWbtPdvt2eUklnNnVA4hye03xTmxTjwhTDTR8uwSQJGjx11M9V4ebiVB5mszQCpzenNX7ZvvPnLdUFtDSKCA4oA_bSleCbFr6OZz7aMm6GEj-VfQA",
    "location": null,
    "date": "02/02/2026 19:02",
    "isVideo": false
  },
  {
    "id": "AF1QipNpyKmqvXuY0hNpSihc2aGEsfcPddmE3PdOtaCR",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNPZ1qEcazP1MXeEPW70gt8s_gonWOWh-bPFa2xr9aR8Y8Vj54D4NNapHlS7cETIexGrZJWh_EV2Q77QFabxldrD0Dx5XyCX5iXnCUTRljGqqrd2ndD",
    "location": null,
    "date": "02/02/2026 18:58",
    "isVideo": true
  },
  {
    "id": "AF1QipORq41NHrTnRkNbffSIByQWfs9bo9AADTWeGp7u",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM5-xa0fg35rbZVuGyf2rN38Y-g4RRpiIBuSWKTd8QyT6J5eAKJEKusb5StMcRDBhtK-IBaj45Q2hZSv6GW-Llt7NEcSE4zD-YPJAqqGcPqYQWMoUud",
    "location": null,
    "date": "02/02/2026 18:42",
    "isVideo": false
  },
  {
    "id": "AF1QipMHfCdNNWY9G_-QDyJwTXVwH5Un6gVTe8H038rG",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOP620_DxIqyQd4DatIsQ4Xwl2UFTO72rhcL9BG2NzQVIpaDUesGKMrP3q9OwTP2nvdWi4sTkmELIzj-4xYXrcYskxNCTRy4f6wbH7HwMJZ1tBlNAf5",
    "location": null,
    "date": "31/12/2025 22:20",
    "isVideo": false
  },
  {
    "id": "AF1QipPSAMwwQ8ZNyM9I1quDEJHpYwKs1Bg7ude3nl5Q",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOWqSuxYL_GdIziNnMqCRdJK7KxX4smZgOJz4hH6O-qctxi4AchqXP65JwPC8IlW0BgcNbe1Khqc3NtuywQEw7qDkeSLPNC-R6j65U0m1CLhGTI9q6T",
    "location": null,
    "date": "31/12/2025 22:20",
    "isVideo": false
  },
  {
    "id": "AF1QipPPKB9syvvFQ6Vttya8_zBrLgsaS7fpDMLIzbpZ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOoBX-ITOEeDPXo7Fcc4pduUqGa91xqhhhTeK0PJCULOVroQ8BDHvuVMP4OglWuaSUIXmMv2CBhlijd6r7NC4lpe-rbvkOIJ6U9ULH1hq4M1y2pi8h1",
    "location": null,
    "date": "31/12/2025 20:28",
    "isVideo": false
  },
  {
    "id": "AF1QipObkVwBlt5pw_y_hnWsLtGJiTtr93iuO6Qv0OCz",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN7Bjttiyx3p09KKPVoNFUEfG8_Do6MxAppwXCubK0mxGj3IEhuZudjxMHQv6WIlxjMBZcBVV64jryIWT7FCiXlNv3rEBJPLekLd0lZxegSbzFrrPvN",
    "location": null,
    "date": "31/12/2025 20:27",
    "isVideo": false
  },
  {
    "id": "AF1QipODrNBUEDC3kZh53IOKtidU5pZLwIE83n1nueb3",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPPn13WW5RBsYAu0lJn-Nc2hQzUtGk3nbGqxgT0RtG5n6XK6XcmbQFPXZNVzMDYiY5cZJpQ7IGCVngfBHYs5ceLaMUT0y5RaNg4zz3u_FeTG_GKx8Gw",
    "location": null,
    "date": "31/12/2025 20:24",
    "isVideo": true
  },
  {
    "id": "AF1QipNh6m0lGzEK5JQhUJuGEO_IkXPq3DttrFFdIjeZ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMmTu_l6rWY2ZE1lxgqO80JgfUvdHDVLkU5_pMMp2mBH3ruTNwEPCpgjBLnRnStXP8Nni1aXosNw630JXFOHgtbaGCluLYUKgMoTa84Sc1DtdImQDbd",
    "location": null,
    "date": "31/12/2025 20:24",
    "isVideo": true
  },
  {
    "id": "AF1QipOrRpcfUgIVJwgEBz19-O8R5EVXRSjOpf6G0EQ4",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMR4DNGhCYx0S73mHgyg3Aph5vz1UVMNAtbK7YxzMd2x-2HrV779p_3bfdTWFEy6tHGMkfh-TWp6s8tBASsF9jw7fMq5WLgdm-TCHKCXWuyblAlCI8o",
    "location": null,
    "date": "31/12/2025 19:53",
    "isVideo": true
  },
  {
    "id": "AF1QipO-aMUXoQRh3EhEaH6Lwxxd8c-BiezMCInFjhwW",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM1_Hh8WYi-4sjJPcSIbXCmmrmiddx0hS5BwaPDHTCcT9l4fsLMkRW2l3zkz22_EQOMPhYOwiDyWPFGM7cecCj1mEcdhrFPxqgp7Eke1cAAUnpXs3sP",
    "location": null,
    "date": "31/12/2025 19:53",
    "isVideo": true
  },
  {
    "id": "AF1QipN_0tX4F2ZeU7e6BSUckd_SWOQENgxW2z2-BjE5",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMxy45rYdYViTJ48ItP6KV0V3HpLmTawzH2yHWRkLg6lCecYbUqpcbSu5yE4qsiRvtBeEfALcdaMRSxGIw9IfsoWB2qx70IHPrKV5KwsdYWNNpQFQ4u",
    "location": null,
    "date": "31/12/2025 19:53",
    "isVideo": true
  },
  {
    "id": "AF1QipN64JW1DDjrE20cPmkzf1bfpsrQlDoNO5UYik4v",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOYMCeI_Cejjd6RgN6HVjwKU5QX2uqZDLfVFqRj6ZnTvDz6U5mRV4Xg0WwmeGNwp_PKh8P-WZlTu5_VG_USUMo2IxZ8k0HEATEO2MKbsDutYxHZZzF9",
    "location": null,
    "date": "31/12/2025 19:52",
    "isVideo": true
  },
  {
    "id": "AF1QipN1vZOks8EjqUKm3Lfe0Ly5hzRty57d8ZtiRZVI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPftcd_z5f1BS5iN2pypyzq1QX0nQOLVnmMmengH9LUBskVpAJYtbKE6GroBA7TAkcZH881txsg0cQ5PeA8_BcavvGLIzXLJ3fqbIYv_78qyDYdLd5P",
    "location": null,
    "date": "31/12/2025 19:52",
    "isVideo": false
  },
  {
    "id": "AF1QipN-4tS_b7wfw-EO5PFKCaPt41eZHf-h3lnfdr0O",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNsnjOiIzz-bGHuG-CPSj4Cwa_GeiCT5TBlQXcBVyDfFKUqza8Uk-JDKtf_3_0WFDjka8QTrdNTHoE3MRAwesBR32Y_jckw7OBm8qyQneENEII18Msy",
    "location": null,
    "date": "31/12/2025 19:52",
    "isVideo": true
  },
  {
    "id": "AF1QipNrj9UM3ZQCDxU2pkuEqDy13yr0fAq7BqgbBrK0",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO4jOgW-ICqtd324gXXrynhNko5Uh22ZE7cWhirqHM4Rw7UUVoeC4JvzzNnAVeo1_d2ptDq5rJ8OanWFcVE03j0jyoAqzuz7nAMWx74-C5_FfW7dxqV",
    "location": null,
    "date": "31/12/2025 19:52",
    "isVideo": true
  },
  {
    "id": "AF1QipNb4kSCwrKH-6OH2PaPalbFSLH-aegSW0pr5mAJ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczM0ds_7NuWF_ZsQ_yx_QAYvzSZ1uzbQRZ33Qt1O3FFJ5Fpi2ewtOR53KQB4X-XwvQ1oYgD6FPI4HzxD-IZhrFqNiklYDLO2N1RcBVt-kd9nCdSlsLjn",
    "location": null,
    "date": "06/12/2025 19:48",
    "isVideo": false
  },
  {
    "id": "AF1QipOLSwgaxVV2sT9sjBKbSq4gh4Ccw1R0ckVLIKkc",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNHy73juSUdQN-24R1itPFBbewE_Itk46D-0ryr-R1W-LBmdNVJ4R_Tg_T4Wdqsr30VIBC1gyPiPnuJblmmGY8WaTXfDOviBaz5sU8HBoQ7LCehbdh3",
    "location": null,
    "date": "06/12/2025 19:48",
    "isVideo": false
  },
  {
    "id": "AF1QipPqazOo-ELJIXRLMfQqa7GzBs77hvDfC-Iy_LL3",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMKOxpdAwjL3UHkWR7mxIEhVwx6gIu8H3rRtQ2LvKQVhoZO_tg2pVrAhi9Hp8RrIEwXMHuDBD2Dc8EiPbWKUh9cpPL8gd2AcZeuzeiVTwXH0FDHg6lK",
    "location": null,
    "date": "06/12/2025 19:48",
    "isVideo": true
  },
  {
    "id": "AF1QipMzpNPjHCfkgZ1aHwn1gqvp6tqlce6tpTY1Fccl",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMHEaqHxEQTp6ih0Gm5gMUsrP6FmuTKfv85NL1953d-nsZbE8-8Go6qPXyZQVBD3zzk4EEVxNduRuI_JycTKoe8QGhYY0ERhrUkHe24Mz9e6ElOP7iP",
    "location": null,
    "date": "20/11/2025 19:03",
    "isVideo": true
  },
  {
    "id": "AF1QipNhK07pwt3i2Xg1Kvw9boa_B0cgkzDxkTQObPZK",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNNMDfjhclU75cpOoQn3YJdyHnVp7OHlcJZNfqr0zTQbk3a7LANnXCnDjrHlnTlgDj5XjeOEhGadqyo1eCfVwBtIYiRu9yGoUQTzTQrcFJ2kQx-Hojb",
    "location": null,
    "date": "06/05/2025 22:46",
    "isVideo": false
  },
  {
    "id": "AF1QipPL1CPYIUkHNPs0fsu74uv2p7ocghmuyHh-Z3KM",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP9RRbKKYxvb0i_U3SvXz4QnCF3Rv7a2oCihjKKWclq_EnUUJeeQngE92dRMUBVW3qD7sWzZcSqkQUfc4_S-V9k3QDj8AVuThL4eOKYS-eqv1Se1lo2",
    "location": null,
    "date": "06/05/2025 22:46",
    "isVideo": false
  },
  {
    "id": "AF1QipN1NqlVagiMCzCq4-144OgSC0Jl3DdYawgWauu7",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPbMx8KzjRtkQW8uOvyn4qRQSvoLX2KWt-KBvVF6zOEMZG7sbamPbsUpPIPGH0qK5pyHtlWEFGsIBxfsDQtMOMOq8TIJ-D_dPC_YqZwgx3WOEBIuolX",
    "location": null,
    "date": "06/05/2025 22:46",
    "isVideo": false
  },
  {
    "id": "AF1QipNFgy0qIAFRzo4IY-Ehj3hF2yIxLghoQwEfhqb2",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNw4tS1oEnCJneOwA5MTeW_WjKdwRNCpfSd2RfcPRRJt9Q7fuKu8Kwjhhdg_pZqrbrX9VUBzy36gi16bU34AFcAAAhi7JH13lohVTBRzMZ_jSvBeHMP",
    "location": null,
    "date": "06/05/2025 22:46",
    "isVideo": false
  },
  {
    "id": "AF1QipOTxUHbFT0qoiRjUinf9G7S7MpTvVG3OWSQ-aLI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMPpiXVMo-se2kCS0ODBNnl2Mq43-rJ9ZMqFvhIpnyvsLxDLSLg6jVQkWDRoOd-DxW89rljEpx_va0KkcSla3fNPTq8UK_-D-41YzplPl1VsXVbtAs0",
    "location": null,
    "date": "06/05/2025 22:41",
    "isVideo": false
  },
  {
    "id": "AF1QipOqpW5z4NOO6V2BVlyoAaOU2ot1IXys2_9N-S0U",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNgftCQYPQJxCdXEErDP7wVFoVLG2yL7AS4vWSmjTVce2Exvz_d1FQpmc3NrrnuEUw4QB-7xMCrw-u1LdU2ACfDepV-8qH_4fAGXKXdL2udove07qKm",
    "location": null,
    "date": "06/05/2025 22:41",
    "isVideo": false
  },
  {
    "id": "AF1QipNesbLbY0TK6bPvDl2C4QlgVgmWf4-xwtdOt-HS",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP0qjNFVIx_fB8bVzKYxwLntlL4LyUiVYxl9R6tK0rYeT27SdEvmyVdZV2S_8L8r7SpSM-qIhG9KyRPKppZcihx2Q4K9u14gEPso0PvIPpty6V19v78",
    "location": null,
    "date": "01/05/2025 19:33",
    "isVideo": false
  },
  {
    "id": "AF1QipNV6mlkwK9ZoPYrVYbNExly5aOaA5aPK3fbzMen",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPziTSSOnUwapyYojZ2Yr7MAnVj1e79zom9vIUY_ZMgSoohUwnoSVIwTvQodyHQIf0ArDWvdy3tsSrpsdtAflnnjqnr82KA63sqAwDSfIUJjaBjPvWc",
    "location": null,
    "date": "22/04/2025 15:58",
    "isVideo": false
  },
  {
    "id": "AF1QipPWw7N5q3fXLhR23wi9O6JxvNmkCvVtoccIlOSP",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOKntSQkmBVX0vhZIW-h5LOtQM9cVbfOCO0DfqgR62DnzuFFQuM_hbXW3w8dUu4jmKQgwuDyMpuIRBPNRNI9URsfTb-ODXDYMNYamcEszYyd5x7vf4s",
    "location": null,
    "date": "22/04/2025 15:58",
    "isVideo": false
  },
  {
    "id": "AF1QipO9rz7ljUmH2wpPtpZzJd-TeT3KS7ogDHdIivtC",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNsknjl7--zeKAiIh8j5_cmMa9lPpLlNzfehjWfnuiljxyRp6bmDIN2w5xzkyDm--Fe8auBVmoI-Tg7_zgeqA1CfwoVPm9lZFy2TDFIK1VqLhV4UjPF",
    "location": null,
    "date": "22/04/2025 15:58",
    "isVideo": false
  },
  {
    "id": "AF1QipNxeMpLa_cCOoxzrTBHUXJnkpEKZCxc0KsQfZgR",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNfuZSW9SHkLXoVsE_8sYcxcWjKRFepCu4HkJSyNxa5QYqlMmxb-vUQLKOd5eU47jyszQKSZE3OGtQ2ucNvvF3sP0YgSIZ9OMjenJONR6KYMPVYA9Wk",
    "location": null,
    "date": "14/04/2025 17:11",
    "isVideo": false
  },
  {
    "id": "AF1QipNgLy96NzPoWLbZahv8QUcKAAm6w04eGaR3W19S",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNWrcy1PT5WgD5QV4lC25TxQ1VVp0xrCHbhjStwkrEYfXh_FvS64WCF51tV825GSmQAhFWL7e35x6E1uYG2zFPMe1d8CMwM0SKJCUhuuoLZjfU05-BM",
    "location": null,
    "date": "19/03/2025 19:40",
    "isVideo": false
  },
  {
    "id": "AF1QipOXxqXp7wq6jo8N0it3gGfMMF-MQ1eq1vFMoMl4",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPAEmfrCcKlQmOdP51aEXfmRnNI7jQojKF3AO6q8UEobDG3EOlHa2uvwc8ZPFU-qpNMJKpnSa-w1fBungJkWCwOx-xRRIQsnb-1r2W8gxYH-RBfQX5W",
    "location": null,
    "date": "19/03/2025 19:38",
    "isVideo": false
  },
  {
    "id": "AF1QipN9fKyuwPq8OJ0kUH1V8Zl6gKLMejZml8CwzRyi",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNtocQ0QWIMvd6YsQ4oQAFS4CSZS2Kz2raWfFyUTXAWBFBWWjUb8pMFemH5aK4gDvuAoGcBIwElXjJhR3nzQNvHgpiM_5Y03QM9Wc06qOLx8euf6Tm8",
    "location": null,
    "date": "02/03/2025 17:14",
    "isVideo": false
  },
  {
    "id": "AF1QipP56sW7o51VbVDv8cGmBGtmoJWPRCiZlEnA3lNP",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOBJH2o-U4rqz2hCZ8XDUSqWd2ZlD2ZXwMi7Oe9125xP2Vbwk3qHJQUcMyz5hrEB__-2ge_3oIaOwKhKzFOl-_4uEiOM5bG8gJKYKokGDkLOq0LQuS8",
    "location": null,
    "date": "02/03/2025 17:14",
    "isVideo": false
  },
  {
    "id": "AF1QipNPZVd6YcPwJxUGRmRmKeUJCQmuRO_Nm5nhEJLs",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMs1QtwbnabfGfn2oBmsHFDmcK6P9SdxvL8SG5ATALHN2DH5GcQ_IarW9cg9mssT0cxUnuuTmQdIGAPD09rWTvtBpDHoIfx4PO-plkhJzfFUNZR3eI7",
    "location": null,
    "date": "02/03/2025 17:14",
    "isVideo": false
  },
  {
    "id": "AF1QipMf_fPqBMgWUEEaC36T0vJNz-dOkt5dkeqnyhBp",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczORnW2Z65iDbhFLTtzsc9AMJLrl--4f_DW8NhYeEEz0rbWZn5q_QNX2qgj7-AuV4P0560ANKr20LNclROM333SgHVjkHRXrW_-nJ6N6Tv9BbTL-jShN",
    "location": null,
    "date": "02/03/2025 17:14",
    "isVideo": false
  },
  {
    "id": "AF1QipMyzxe8VMhSIeGtVii0AdyJqnzmquCMp8YxSe0Z",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN7Si1o_S0GExaVJnOFPUDD762Jv7_03CfPaDg_QPQJ949DeRXFRaoX1NemE5oawrNwP3M-eWyTt_RBOJ_0NZE23_C7sGxy99lqs1PkEtZ2njt4vIjR",
    "location": null,
    "date": "02/03/2025 17:14",
    "isVideo": false
  },
  {
    "id": "AF1QipOmzRon0xGgTqg2w0QYNSW3vldo3ThlXoCsphGI",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNLFIR8Wr_PCqoEhmLibPGFCRHM5-AUCd7gcDgCfBqkFrsY6VwoGv1IRbUxSl4t1AtoARmJFH8XV9SHT7F3xcdZtH7v_dnIQ8RkfrdHIhDCzTW9FoOK",
    "location": null,
    "date": "02/03/2025 17:14",
    "isVideo": false
  },
  {
    "id": "AF1QipMe9zuzkkqWx7zwUVQNAsndXJcwpGmuNphJx3ZL",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOQACiRVMKTLMdsU3Skw1PUY2PM9BxFHRP7ypChK_PjYutBqhhPk_3y_phZWa7Ke_jiaGXLFxd3XDnJT_3rpUpwyUcONiR4yje5jKOH4R5mTXSU7O7D",
    "location": null,
    "date": "02/02/2025 07:07",
    "isVideo": false
  },
  {
    "id": "AF1QipMSt_v8maaDM1m9x9FRLh-KEIMgtV2ZwMxEvQ3n",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMP-tCDmZd9FcJNFopHstDqaw4Rx8jbAOQUi9aXyZTnISFHYbRL6fNCe5uFojSyFMXKTqAhlMacyP9d7tkb_BuFcryF50-CSaNUJ5sw6KucLHDfdQiy",
    "location": null,
    "date": "02/02/2025 07:07",
    "isVideo": false
  },
  {
    "id": "AF1QipPltuAWvF1LxZ4AVjVMU3MZzokpyaeKa7kz4i9D",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNW_sacidAvq63NfPsRAOPzj5UXUUzk2GST24vnVduGfsAJ2RH-nigSHpZ23hyDQMkgm7Yab-wAd-QhRn6mKf22ax7f57HfAySv2vlIjx4PGSUM4mGV",
    "location": null,
    "date": "02/02/2025 07:07",
    "isVideo": false
  },
  {
    "id": "AF1QipPXkwWR0JUPQqs2aMPmfBh2oQW1griqFCQeTryh",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMS75JKTwVlbjMh9Yo__SXIjbpL4A1RbcVEEbkQ5Me9VatladqTqGSDDaVvShsEFmXGTlOjpYLv_n5zGPB5pYOKgsqPjC6nTn9sV9pf2sVYTp2o-lr0",
    "location": null,
    "date": "02/02/2025 07:07",
    "isVideo": true
  },
  {
    "id": "AF1QipN0NBiSt4qOhQNjKN9fJTjwnJIxrlj4ySaX379H",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMllCmrZHgACn_iOn9vsUXnpZnVzmpBou76bqcTO9lD9ayJHdr25-nfLh_WFNTlHrIleRicRHMOY7VHxKZiO2TJdqKcKDA_xIxDg8qOYba1OfU5YPfe",
    "location": null,
    "date": "02/02/2025 07:07",
    "isVideo": false
  },
  {
    "id": "AF1QipMclmHUJEIFvek2sPXaX8mmdK3qJYOCxy9GRHR5",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczP6caCxV9PTLnS5Jkv7YWshqq9zSRHO2NQJRND0nuTY-cn433XS0AZix85XPwvH2WOixth5hRyBFfEa6FZjsoHzlKbxPZMkg2z5V5hT3v0aPlJKQuIi",
    "location": null,
    "date": "02/02/2025 07:07",
    "isVideo": false
  },
  {
    "id": "AF1QipMT9iuxpGnrx3Hmg_MaiSMUJnEdizPrhq2n7gda",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOUehU9MzuPljgyzG7XQwRFlfW7GLysAHmlHnhp49mfY2ijIp3FahC9YqWKJnzsAIEgBxgdglGk9EdyAk6koWWg-QZhiQtd6t0NFbtA1HQxAkd7ZXXZ",
    "location": null,
    "date": "02/02/2025 07:07",
    "isVideo": false
  },
  {
    "id": "AF1QipM10BLjb7dVRMa6RDzKT6oAr1w95gXxkaFDKRg7",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPeE2V3eYsoTKW9mg6G8ldoI3vs0-1kCliq3c36td2-7OrJksdc0x6z2RJtB2q8nqLY-zqYtvOKNoR0vW1nwlyA6fp2eQZ5FocBjHeFxZHernSmCzw0",
    "location": null,
    "date": "02/02/2025 07:07",
    "isVideo": false
  },
  {
    "id": "AF1QipOuUm6CGTOYiJIbmEaePi1icKcnFmpA45iZs7sS",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPsM8-1JhDm1oo6xeDps2DB441_dpZV-QRqFzvAzzgWzeItl7mnByQWiQ1ONeVPsbGMq4FV8P2UqvPKEhooYBrwM6i8wG3WV39gOESc5N2oIBxehaL1",
    "location": null,
    "date": "01/02/2025 16:13",
    "isVideo": true
  },
  {
    "id": "AF1QipP7mZ2co_mk0RUkpXybFgwJ9Utkwuo7E_6jG7CP",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNwAX7Dti4tuA-z2umK9p7gktRA5TCxjYRh2BcHozU_eQBosvkYgiDqDL_IWBD45ZpkMuxZCLHOyLCSTm3E9dhEzOyQoST9bj3pPK5kkbniK8PRA7bY",
    "location": null,
    "date": "28/01/2025 20:23",
    "isVideo": false
  },
  {
    "id": "AF1QipPxv0KX0rKXtWZvnj3i-d1EWEOGwwByXmu0NrHW",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNQCVldokrox_F3yhjPWsNgFeikCrtbXY7l4jFyS1PG5zGITaPgmCGAeQ88l8AX0cflcvuzUOR2qwxMl3h_OndACnmmh9lfGM7ksiwVaAUNJmd3N8Nh",
    "location": null,
    "date": "26/01/2025 23:19",
    "isVideo": false
  },
  {
    "id": "AF1QipNSKoCDqCgxfdajDdoU6pwAjoiVvNRMZsKIJdf-",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczO6jvetKa6cMHSxt7hnV_SbDHGNT5NQPNS7N8D2kXVebfBXSUDVI4msFmKaBTOSJjZhskZKA3-fUKILrmcKaRrAgd_47U0_RaUZKGMPXaQT6y1tDALq",
    "location": null,
    "date": "26/01/2025 23:19",
    "isVideo": false
  },
  {
    "id": "AF1QipOGhWBxZx3NdbX2sAXu8YU-G--O0J1nBxMxN1En",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNi-a3Vl3BIiuQau09Jr8ssmY9h9xLWY4hrJVAwBI2Pu_J6WT3OKz7ELGQ7yVFDnuNEC8J3uwMyPNJUfzeAOOfjQo3zdouicVKpxesDNyzqnYchxvs",
    "location": null,
    "date": "20/01/2025 18:20",
    "isVideo": false
  },
  {
    "id": "AF1QipM3ID8jiCjS7hNQ7qmLriVDmxiZvT5PK25oMBEJ",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNTqqV134wNdaQBImGSnyhYZQfVtjVASVJOdwHgBTQM8mPgDySvG3KOiN_I7QATyr6GKerozPVcs5XZDmd1T1KFcDqphJVvqKMcQ91yhaiqYguLBe4",
    "location": null,
    "date": "20/01/2025 18:17",
    "isVideo": false
  },
  {
    "id": "AF1QipONo509kiPYcrRgjrVUZXOH0hdCYqp_DqJ2dt3y",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMArU9FFWK4FcYFxbc_HgSyyUY5y5xDWTdmR_too6xRdNm8K56g_AqjvTpmBn9OURoJQ-JdQkZ-Vxzb5tOlwg2rfpstDZiKDcVwsyy5I2iooqOjutg",
    "location": null,
    "date": "20/01/2025 17:53",
    "isVideo": false
  },
  {
    "id": "AF1QipOvxN8cZ_gteSIX7pQwCrFDAv-t8XYhej4neH68",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMA4jqj6BqiHPXqIceWSblqTH9BHGBjqxxl4KQNh3r699JW68fXrnoIaBz0nFu7-9xPaO-AVhwsXu0zVkYqJd9tn-mui8r238C-3tlcH4AructvhUo",
    "location": null,
    "date": "17/01/2025 18:47",
    "isVideo": false
  },
  {
    "id": "AF1QipPCqYiZmaGl4jfZj89td_jGNmkZ85649AtU7tle",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN0bE8ojgCcjKo694ykI7eZtJydxFZrmcCeRO54Smmj9i2Cc5gFOrUSF0c7KByTMjaiYnuufmM_83U6gXz2yUFEyWVsbLWYNzkLzXF4zfKq1GG4AD8",
    "location": null,
    "date": "12/01/2025 21:53",
    "isVideo": false
  },
  {
    "id": "AF1QipMOWlXFJvORmT_DhqgwcK3XpoSVZe1zNQJAOJJe",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPANG63if1yG9TiP6za0lnrfETkUuT-UTbeFf9FW9uAmhHNdifvSNDuJ7epMvx2aUL9XwkXL1-xgqUoPjDJgaVnRkAuY2toP7A5DZ1Cx02ockH0M3o",
    "location": null,
    "date": "07/01/2025 16:30",
    "isVideo": false
  },
  {
    "id": "AF1QipOmZHxLQcuIZ8gYjs3LNmN6T_m4hVnyhSfWXb9I",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPK_wBIEbm9hVI22ztq_w3XTz8ZFsy957-H_MQ8MbpuRL4BOv02P8v0cHYNqz7z-itP3hEi3CUsr_ZT0HzxbozSWvcgoZqW3xzxeUk_vY0_ChKO6mI",
    "location": null,
    "date": "16/12/2024 22:14",
    "isVideo": false
  },
  {
    "id": "AF1QipPm9MO_XSSczuj9qX8lR54ijI_QCaJjMmvjpI1H",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczN3abAFkCKlXqN546ChdC5uWjIEYiiJFuWMRwEDB144XgxHb5baC6Uz1Q6hGmDuMGi4abff4tlchmQ5LvRmPAkzcHV5-bN5j2ztwbbPxgeyLPs-tJE",
    "location": null,
    "date": "12/12/2024 01:19",
    "isVideo": false
  },
  {
    "id": "AF1QipOj5vgrskSaEBfYFHECUgQ8v0ihmy444aAmj4Iu",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNtpbku24C4q5L9b3YWx9kbEYYS2R9nenqZGyXvOCQwcFsaoQXRh9jRIzgODK43xFPjAm1N3_n8vNj68n4sJCjYxScg6yEDdDg13LDpPpiHS33Hp2U",
    "location": null,
    "date": "08/12/2024 16:41",
    "isVideo": false
  },
  {
    "id": "AF1QipMqxiZkxA2pVYvV2cyt3uqj_T9WEOOR1_HDQqu5",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczMzbiR1jwdJvvLoe1l0DJ302JbyExcUb83nh5dM3QIYSI9W4CZpDK77jh9vnGF5d0l9WI2piH5-Jwvwyu8B_9Og7HJbxJGKzZZAFr1ky6vXVgBXxe0",
    "location": null,
    "date": "08/12/2024 16:39",
    "isVideo": false
  },
  {
    "id": "AF1QipMF9tid910j8S76rB6_dmkkbH_dAeCpr0XUg8j4",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOgJmT89HuCV6wC-9UJY4_0hMuWjV7pSeZ3H5_WBsWOX76GVKM-tW46fHFpPv12_EDPY5WC2Xep9bt4V59p62EEcsBf7ZAIzTRNDlKkx9IxLd8vkt0",
    "location": null,
    "date": "08/12/2024 16:36",
    "isVideo": false
  },
  {
    "id": "AF1QipNK_qI6I4JnCGr60Byi4Hjs7P4k-UB8LNOXQBOF",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOva9lmBrosH1lcL9RzTcW7vb-lr9NbXd3hGSxitkH-jDSriHFLILKKumyiUKm2mCgZb31ty4Lxy5AdQPCfKdnSZ02Kcs8uZnJ069w1-92nTt3OrPs",
    "location": null,
    "date": "08/12/2024 16:32",
    "isVideo": false
  },
  {
    "id": "AF1QipN0ErmpGXv6AAcEJrPqjG1A_b43k-Dc8OXB2n9z",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOoeDWFqvmoYdw0qBnJsdvWcN8kXqUQrfI9puoOel3b5mpTsvGeMXDsiR-C_LCOOSChvlLYSpySDMY42-Pmz5w4RKou4-QG4jlCTywJ08f2DSR1drs",
    "location": null,
    "date": "08/12/2024 16:28",
    "isVideo": false
  },
  {
    "id": "AF1QipPSPBUQYwx7XGfJMo3H5i9TGZ_Da3k2yX7ewSuH",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNWiO87-GO-zoLUvWDQj0lZMb9OyHx3hIcmmthnF8gvWGpnNFF6KWK2xYnIY6I7CcXG3HFW54u3XfSmbQbw5wGYIBGvNK4YauIe_dE4oqiSRN-oTFw",
    "location": null,
    "date": "08/12/2024 16:27",
    "isVideo": false
  },
  {
    "id": "AF1QipPyJYmoUVI6iFczf_lNiLtT40335R8Qz6VATqUr",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczPejvzDph293zCzqmxiwo9YRit97ZLlblEHmsXsIrKPNhu8Xnuj4WkYoFyu8YRLeBm8aSUG8_mE9g-N56hN9GUbgKHhFRCL1yY6vskFxJ1KC3BPZzc",
    "location": null,
    "date": "08/12/2024 16:20",
    "isVideo": false
  },
  {
    "id": "AF1QipM_FnvFez-SSPMNy8Nc0QCRmPRB97v_S4yZRA9J",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczOSSXtUrK-e-t2ljsE_xOaM2RcEqcBfFiLkDW_vwWB0iSSPwKqVW5Ey3-dgCGKu3BODEucv-hNHIMbRMxJ1WtLTEz72aUGjWB4d7eDlFxpRASVNGEE",
    "location": null,
    "date": "08/12/2024 16:06",
    "isVideo": false
  }
];

export const ALL_PHOTOS = RAW_MEDIA.map(p => {
  let location = null;
  const pDate = parseDate(p.date);
  if (pDate) {
    for (const rule of LOCATION_RULES) {
      const startParts = rule.start.split("/");
      const endParts = rule.end.split("/");
      const startDate = new Date(parseInt(startParts[2]), parseInt(startParts[1]) - 1, parseInt(startParts[0]));
      const endDate = new Date(parseInt(endParts[2]), parseInt(endParts[1]) - 1, parseInt(endParts[0]));
      
      if (pDate >= startDate && pDate <= endDate) {
        location = rule.location;
        break;
      }
    }
  }
  return {
    ...p,
    location: location
  };
});
