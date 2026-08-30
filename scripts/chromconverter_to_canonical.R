args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 3) stop("usage: input output format_in")
suppressPackageStartupMessages(library(chromConverter))
input <- normalizePath(args[[1]], mustWork = TRUE)
output <- args[[2]]
format_in <- args[[3]]
chroms <- read_chroms(input, find_files = FALSE, format_in = format_in)
dat <- if (is.data.frame(chroms) || is.matrix(chroms)) chroms else chroms[[1]]
if (is.matrix(dat)) {
  times <- suppressWarnings(as.numeric(rownames(dat)))
  if (length(times) != nrow(dat) || any(!is.finite(times))) {
    times <- seq_len(nrow(dat)) - 1
  }
  canonical <- data.frame(time = times, signal = as.numeric(dat[, 1]))
} else {
  numeric_cols <- names(dat)[vapply(dat, is.numeric, logical(1))]
  if (length(numeric_cols) < 2) stop("chromConverter output has fewer than two numeric columns")
  canonical <- data.frame(time = dat[[numeric_cols[[1]]]], signal = dat[[numeric_cols[[2]]]])
}
canonical <- canonical[is.finite(canonical$time) & is.finite(canonical$signal), ]
canonical <- canonical[order(canonical$time), ]
write.csv(canonical, output, row.names = FALSE)
