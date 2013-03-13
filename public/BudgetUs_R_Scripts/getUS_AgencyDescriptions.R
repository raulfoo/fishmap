setwd("/Users/raulfoo/BudgetUs/BudgetUs_R_Scripts")

names = read.table("uniqueSearches_UnNested.txt",sep=",",stringsAsFactors=F)
keeps = which(names[,9]=="agency" | names[,9]=="bureau")
names = names[keeps,]
uniqueNames = unique(names[,3])

removes = grep("All --",uniqueNames)

uniqueNames = uniqueNames[-removes]

urlSearch = tolower(gsub(" ","-",uniqueNames))
allOut = c()


readDat = function(i){
	data = readLines(paste("http://www.usa.gov/directory/federal/",urlSearch[i],".shtml",sep=""))
	
	data
	}
	
for(i in 1:length(urlSearch)){
	print(i)
	sleepTime = sample(13:18,1)
	Sys.sleep(sleepTime)
	dat = tryCatch(readDat(i),error = function(e) e)
	if(inherits(dat,"error")) next
	
	title = grep('h1 id="title_dl"',dat)
	start = gregexpr('>.*</h1>',dat[title])[[1]][1]
	stringLen = attributes(regexpr('>.*</h1>',dat[title]))[[1]]
	if(start > 0 & stringLen > 0){
		agencyTitle = substr(dat[title],start+1,(start+stringLen-6))
	}else{
		agencyTitle="Not Available"
		
	}
	
	workDat = dat[title:length(dat)]
	descriptionIndex = grep("<p>.*</p>",workDat)[1]
	workDat = workDat[descriptionIndex]
	
	start = gregexpr("<p>.*</p>",workDat)[[1]][1]
	stringLen = attributes(regexpr("<p>.*</p>",workDat))[[1]]
	
	if(length(start) > 0 & length(stringLen) > 0){
		descriptionString = substr(workDat,start+3,start+stringLen-5)
	}else{
		descriptionString="Not Available"
		
	}

	
	descriptionString = substr(workDat,start+3,start+stringLen-5)
	
	workDat = dat[title:length(dat)]
	
	linkIndex = grep('<a class="url" href',workDat)[1]
	workDat = workDat[linkIndex]
	
	start = gregexpr('href=.*\\.gov',workDat)[[1]][1]
	stringLen = attributes(regexpr('href=.*\\.gov',workDat))[[1]]
	
	if(start > 0 & stringLen > 0){
		linkString = substr(workDat,start+6,start+stringLen-1)	}else{
		linkString="Not Available"
		
	}


	
	
	out = c(uniqueNames[i],agencyTitle,descriptionString,linkString)
	allOut = rbind(allOut,out)
}

write.table(allOut,"agencyDescriptions.txt",sep=",",col.names=F,row.names=F)
