setwd("/Users/raulfoo/BudgetUs/public/BudgetUs_R_Scripts")

agency = read.table("agencyDescriptionsAbbreviated.txt",sep=",",stringsAsFactors=F)

subfunction = read.table("Subfunction_descriptions.txt",sep=",",stringsAsFactors=F)

output = rbind(subfunction,agency)

write.table(output,"fullDescriptions.txt",row.names=F,col.names=F,sep=",")
